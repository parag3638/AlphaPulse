"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { PieChart, Pie, Cell, Label, TooltipProps } from "recharts"
import {
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartConfig } from "@/components/ui/chart"

type StatusSlice = { status: string; count: number }

interface StatusPieProps {
    data: StatusSlice[]
    title?: string
    description?: string
    maxSlices?: number
    className?: string
}

const COLOR_VARS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
]

function StatusTooltip({ active, payload }: TooltipProps<number, string>) {
    if (!active || !payload || !payload.length) return null
    const p = payload[0]
    const name = String(p?.name ?? "")
    const value = Number(p?.value ?? 0)
    const total = payload[0]?.payload?._total ?? 0
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0"

    return (
        <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow">
            <div className="font-medium">{name}</div>
            <div className="text-muted-foreground">{value} cases · {pct}%</div>
        </div>
    )
}

export default function StatusPie({
    data,
    title = "Cases by Status",
    description = "Current distribution",
    maxSlices,
    className,
}: StatusPieProps) {
    // trim to top N if requested
    const sorted = React.useMemo(
        () => [...data].sort((a, b) => b.count - a.count),
        [data]
    )
    const slices = maxSlices ? sorted.slice(0, maxSlices) : sorted

    const total = React.useMemo(
        () => slices.reduce((acc, d) => acc + (Number(d.count) || 0), 0),
        [slices]
    )

    // Build config for ChartContainer (labels/colors)
    const { chartData, chartConfig } = React.useMemo(() => {
        const chartData = slices.map((d, i) => ({
            name: d.status,
            value: d.count,
            fill: COLOR_VARS[i % COLOR_VARS.length],
            _total: total, // for tooltip %
        }))
        const cfg: ChartConfig = {}
        chartData.forEach((d) => {
            cfg[d.name] = { label: d.name, color: d.fill }
        })
        return { chartData, chartConfig: cfg }
    }, [slices, total])

    return (
        <div className={`flex flex-col h-full ${className || ""}`}>
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[280px]"
                >
                    <PieChart>
                        <ChartTooltip cursor={false} content={<StatusTooltip />} />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={80}
                            strokeWidth={8}
                        >
                            {chartData.map((entry, i) => (
                                <Cell key={entry.name} fill={entry.fill} />
                            ))}

                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {total.toLocaleString()}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Cases
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
                {/* Legend */}
                <div className="grid w-11/12 grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    {chartData.map((d) => {
                        const pct = total > 0 ? Math.round((Number(d.value) / total) * 100) : 0
                        return (
                            <div key={d.name} className="flex justify-center items-center gap-2 text-xs">
                                <span
                                    className="inline-block h-2 w-2 rounded-full ring-1 ring-border"
                                    style={{ backgroundColor: d.fill }}
                                    aria-hidden="true"
                                />
                                <span className="truncate capitalize">{d.name} :</span>
                                <span className="ml-1 text-xs font-mono tabular-nums text-muted-foreground">
                                    {d.value}
                                </span>
                            </div>
                        )
                    })}
                </div>
                <div className="text-xs min-[1540px]:text-sm text-muted-foreground">
                    Total {total} cases • Showing {slices.length} status{slices.length !== 1 ? "es" : ""}
                </div>
            </CardFooter>
        </div>
    )
}
