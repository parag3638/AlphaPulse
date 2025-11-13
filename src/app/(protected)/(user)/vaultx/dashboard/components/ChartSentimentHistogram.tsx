"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { TooltipProps } from "recharts"

// ----- Types -----
export type HistogramBin = {
  min: number
  max: number
  count: number
}

interface ChartHistogramProps {
  data: HistogramBin[]
  title?: string
  description?: string
  colorVar?: string            // CSS var like "var(--chart-2)"
  unitLabel?: string           // e.g. "items", "events", "headlines"
  decimals?: number            // label precision, default 1
  className?: string
  trendText?: string
}

// ----- Tooltip -----
function HistogramTooltip({
  active,
  payload,
  label,
  unitLabel = "items",
}: TooltipProps<number, string> & { unitLabel?: string }) {
  if (!active || !payload || payload.length === 0) return null
  const v = payload[0]?.value
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow">
      <div className="font-medium">{String(label)}</div>
      <div className="text-muted-foreground">
        {Number.isFinite(Number(v)) ? `${v} ${unitLabel}` : String(v)}
      </div>
    </div>
  )
}

// ----- Component -----
export function ChartSentimentHistogram({
  data,
  title = "Sentiment Histogram",
  description = "Counts per sentiment bucket",
  colorVar = "var(--chart-2)",
  unitLabel = "items",
  decimals = 1,
  className,
  trendText,
}: ChartHistogramProps) {
  // Build display rows: range label + count
  const rows = (data ?? []).map((b) => {
    const fmt = (n: number) => n.toFixed(decimals)
    const range = `${fmt(b.min)} to ${fmt(b.max)}`
    return { range, count: b.count }
  })

  const chartConfig: ChartConfig = {
    count: { label: "Count", color: colorVar },
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={rows}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="range"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              // keep labels readable; these are short ranges
              interval={0}
            />
            <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
            <ChartTooltip cursor={false} content={<HistogramTooltip unitLabel={unitLabel} />} />
            <Bar dataKey="count" fill="hsl(var(--color-count))" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>

      {(trendText || rows?.length) ? (
        <CardFooter className="flex-col items-start gap-2 text-sm">
          {trendText ? <div className="leading-none font-medium">{trendText}</div> : null}
          <div className="text-muted-foreground leading-none">
            Showing {rows.length} bucket{rows.length !== 1 ? "s" : ""}
          </div>
        </CardFooter>
      ) : null}
    </Card>
  )
}
