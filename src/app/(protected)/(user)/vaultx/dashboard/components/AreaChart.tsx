"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"


type ChartPoint = { date: string; price: number }
type Meta = { symbol: string; last: number; change: number; changePct: number }

const chartConfig = {
    price: { label: "Price", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig

export default function AreaChartInt({
    series,
    meta,
}: {
    series: ChartPoint[]
    meta?: Meta
}) {
    const [timeRange, setTimeRange] = React.useState<"90d" | "30d" | "7d">("90d")

    const filteredData = React.useMemo(() => {
        if (!series?.length) return []
        // filter by trailing window from the latest point
        const lastTs = new Date(series[0]?.date) < new Date(series[series.length - 1]?.date)
            ? new Date(series[series.length - 1]?.date)
            : new Date(series[0]?.date)
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
        const start = new Date(lastTs)
        start.setDate(start.getDate() - days)
        return series.filter(p => new Date(p.date) >= start)
    }, [series, timeRange])


    // 1) compute domain from ALL data passed (series), with ±5% padding
    const yDomain = React.useMemo<[number, number]>(() => {
        const prices =
            series
                ?.map((point) => point.price)
                .filter((price): price is number => Number.isFinite(price)) ?? []

        if (!prices.length) {
            const fallback =
                typeof meta?.last === "number" && Number.isFinite(meta.last)
                    ? meta.last
                    : 0
            return [fallback, fallback]
        }

        const min = Math.min(...prices)
        const max = Math.max(...prices)
        const spread = max - min
        const padBasis = spread === 0 ? Math.abs(max || min || 1) : spread
        const pad = padBasis * 0.75

        return [min - pad, max + pad]
    }, [series, meta])



    return (
        <>
            <div className="">
                
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                    <AreaChart data={filteredData}>
                        <defs>
                            <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid vertical={false} />

                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}

                            minTickGap={32}
                            tickFormatter={(value: string) => {
                                const d = new Date(value)
                                return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" })
                            }}
                        />

                        <YAxis
                            domain={yDomain}
                            tickLine={false}
                            axisLine={false}
                            width={30}
                            tick={false}
                            tickFormatter={(value: number | string) =>
                                typeof value === "number"
                                    ? value.toLocaleString("en-GB", {
                                        minimumFractionDigits: value < 100 ? 2 : 0,
                                        maximumFractionDigits: value < 100 ? 2 : 0,
                                    })
                                    : value
                            }
                        />

                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) =>
                                        new Date(value as string).toLocaleDateString("en-GB", {
                                            month: "short",
                                            day: "numeric",
                                        })
                                    }
                                    indicator="dot"
                                />
                            }
                        />

                        <Area
                            dataKey="price"
                            type="natural"
                            fill="url(#fillPrice)"
                            stroke="var(--color-price)"
                            dot
                        />

                        <ChartLegend content={<ChartLegendContent />} />
                    </AreaChart>
                </ChartContainer>

            </div>
        </>
    )
}
