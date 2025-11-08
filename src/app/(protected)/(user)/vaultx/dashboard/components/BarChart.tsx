"use client"

import { TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent, // keeps import if you use it elsewhere
} from "@/components/ui/chart"

type AgeBucket = {
  range: string
  count: number
}

interface ChartBarBucketsProps {
  data: AgeBucket[]
  title?: string
  description?: string
  colorVar?: string // CSS var like "var(--chart-1)"
  trendText?: string
  className?: string
}

// ---- Custom tooltip to avoid `valueFormatter` prop error ----
function CasesTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null
  const value = payload[0]?.value
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow">
      <div className="font-medium">{String(label)}</div>
      <div className="text-muted-foreground">
        {Number.isFinite(Number(value)) ? `${value} cases` : String(value)}
      </div>
    </div>
  )
}

export function ChartBarBuckets({
  data,
  title = "Age Distribution",
  description = "Case count by age group",
  colorVar = "var(--chart-1)",
  trendText = "Trending up this period",
  className,
}: ChartBarBucketsProps) {
  const chartConfig: ChartConfig = {
    count: {
      label: "Count",
      color: colorVar,
    },
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="range"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={32}
              allowDecimals={false}
            />
            <ChartTooltip cursor={false} content={<CasesTooltip />} />
            <Bar dataKey="count" fill="hsl(var(--color-count))" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        {trendText ? (
          <div className="flex gap-2 leading-none font-medium">
            {trendText} <TrendingUp className="h-4 w-4" />
          </div>
        ) : null}
        <div className="text-muted-foreground leading-none">
          Showing {data.length} bucket{data.length !== 1 ? "s" : ""}
        </div>
      </CardFooter>
    </Card>
  )
}
