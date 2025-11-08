"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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
  ChartTooltipContent,
} from "@/components/ui/chart"

type ChartPoint = {
  date: string
  count: number
}

interface ChartLineLinearProps {
  data: ChartPoint[]
  title?: string
  description?: string
  color?: string
  trendText?: string
}

export function ChartLineLinear({
  data,
  title = "Line Chart - Linear",
  description = "Showing trend over time",
  color = "var(--chart-1)",
  trendText = "Trending up this period",
}: ChartLineLinearProps) {
  const chartConfig: ChartConfig = {
    count: {
      label: "Count",
      color,
    },
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(val) => {
                try {
                  const d = new Date(val)
                  return d.toLocaleDateString("en-IN", {
                    month: "short",
                    day: "2-digit",
                  })
                } catch {
                  return val
                }
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={30}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              type="linear"
              dataKey="count"
              stroke={"red"}
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {trendText} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing {data.length} data point{data.length !== 1 ? "s" : ""} (latest{" "}
          {data[data.length - 1]?.date})
        </div>
      </CardFooter>
    </Card>
  )
}
