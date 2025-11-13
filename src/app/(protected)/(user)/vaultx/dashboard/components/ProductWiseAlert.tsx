"use client"

import * as React from "react"
import { PieChart, Pie, Cell, Label, TooltipProps } from "recharts"
import {
    CardHeader, CardContent, CardFooter,
    CardTitle, CardDescription,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartConfig } from "@/components/ui/chart"

type StatusSlice = { status: string; count: number }

interface StatusPieProps {
    data: StatusSlice[]               // [{ status, count }]
    title?: string
    description?: string
    maxSlices?: number
    className?: string
    unitLabel?: string                // NEW: center/tooltip label, e.g. "headlines"
}

const COLORS_BY_KEY: Record<string, string> = {
    // impact mix
    high: "hsl(var(--chart-4))", // red-ish
    medium: "hsl(var(--chart-2))", // amber
    low: "hsl(var(--chart-1))", // green-ish
}
const COLOR_FALLBACKS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
]

function StatusTooltip({ active, payload, label }: TooltipProps<number, string>) {
    if (!active || !payload || !payload.length) return null
    const p = payload[0]
    const name = String(p?.name ?? "")
    const value = Number(p?.value ?? 0)
    const total = payload[0]?.payload?._total ?? 0
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0"
    const unit = payload[0]?.payload?._unit ?? "items"

    return (
        <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow">
            <div className="font-medium capitalize">{name}</div>
            <div className="text-muted-foreground">{value} {unit} · {pct}%</div>
        </div>
    )
}

export default function StatusPie({
    data,
    title = "Cases by Status",
    description = "Current distribution",
    maxSlices,
    className,
    unitLabel = "items",
}: StatusPieProps) {
    // Stable orders for known status sets
    const TREND_ORDER = ["rising", "flat", "falling"]
    const IMPACT_ORDER = ["high", "medium", "low"]
    const sorted = React.useMemo(() => {
        const normalize = (status: string) => status.toLowerCase()
        const allInOrder = (order: string[]) => data.every(d => order.includes(normalize(d.status)))
        const sortByOrder = (order: string[]) =>
            [...data].sort((a, b) => order.indexOf(normalize(a.status)) - order.indexOf(normalize(b.status)))

        if (allInOrder(IMPACT_ORDER)) return sortByOrder(IMPACT_ORDER)
        if (allInOrder(TREND_ORDER)) return sortByOrder(TREND_ORDER)
        return [...data].sort((a, b) => b.count - a.count)
    }, [data])

    const slices = maxSlices ? sorted.slice(0, maxSlices) : sorted
    const total = React.useMemo(() => slices.reduce((acc, d) => acc + (Number(d.count) || 0), 0), [slices])

    const { chartData, chartConfig } = React.useMemo(() => {
        const chartData = slices.map((d, i) => {
            const key = d.status.toLowerCase()
            const fill = COLORS_BY_KEY[key] ?? COLOR_FALLBACKS[i % COLOR_FALLBACKS.length]
            return {
                name: d.status,
                value: d.count,
                fill,
                _total: total,
                _unit: unitLabel,
            }
        })
        const cfg: ChartConfig = {}
        chartData.forEach(d => { cfg[d.name] = { label: d.name, color: d.fill } })
        return { chartData, chartConfig: cfg }
    }, [slices, total, unitLabel])

    return (
        <div className={`flex flex-col h-full ${className || ""}`}>
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                {description ? <CardDescription>{description}</CardDescription> : null}
            </CardHeader>

            <CardContent className="flex-1 pb-0">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
                    <PieChart>
                        <ChartTooltip cursor={false} content={<StatusTooltip />} />
                        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={80} strokeWidth={8}>
                            {chartData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                                    {total.toLocaleString()}
                                                </tspan>
                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                                    {unitLabel}
                                                </tspan>
                                            </text>
                                        )
                                    }
                                    return null
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>

            <CardFooter className="flex-col gap-3">
                <div className="grid w-11/12 grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    {chartData.map((d) => (
                        <div key={d.name} className="flex justify-center items-center gap-2 text-xs">
                            <span className="inline-block h-2 w-2 rounded-full ring-1 ring-border" style={{ backgroundColor: d.fill }} />
                            <span className="truncate capitalize">{d.name} :</span>
                            <span className="ml-1 text-xs font-mono tabular-nums text-muted-foreground">{d.value}</span>
                        </div>
                    ))}
                </div>
                <div className="text-xs min-[1540px]:text-sm text-muted-foreground">
                    Total {total} {unitLabel} • Showing {slices.length} item{slices.length !== 1 ? "s" : ""}
                </div>
            </CardFooter>
        </div>
    )
}
