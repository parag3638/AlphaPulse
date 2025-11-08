"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useBreakpointValue } from "@/components/hooks/useBreakpointValue"

// incoming data type
type DiagnosisMix = {
    label: string
    [category: string]: string | number
}

interface DiagnosisMixCardProps {
    data: DiagnosisMix[] // [{ label: "Diagnosis Mix", Neoplasms: 4, ... }]
    title?: string
    description?: string
    className?: string
    topN?: number // default responsive
    showHiddenNote?: boolean // default true
}

const SHADE_CLASSES = [
    "bg-[hsl(var(--chart-1))]",
    "bg-[hsl(var(--chart-2))]",
    "bg-[hsl(var(--chart-3))]",
    "bg-[hsl(var(--chart-4))]",
    "bg-[hsl(var(--chart-5))]",
]

export function DiagnosisMixCard({
    data,
    title = "Diagnosis Mix",
    description = "Top categories by case count",
    className,
    topN, // if passed, overrides responsive
    showHiddenNote = true,
}: DiagnosisMixCardProps) {
    const row = data?.[0]
    if (!row) return null

    const responsiveTopN =
        useBreakpointValue<number>({
            base: 4,  // < 640
            sm: 4,    // optional
            md: 5,    // ≥ 768
            lg: 4,    // ≥ 1024
            xl: 6,    // ≥ 1280  <-- smaller than md, that's OK
            "2xl": 4, // ≥ 1536
            "3xl": 5, // ≥ 1600
        }) ?? 3

    // IMPORTANT: use the responsive value unless you *intentionally* override via prop
    const effectiveTopN = topN ?? responsiveTopN

    // 1) extract categories (exclude "label")
    const allEntries = Object.entries(row)
        .filter(([k]) => k !== "label")
        .map(([k, v]) => [k, Number(v) || 0] as const)

    // 2) sort desc by count
    const sorted = allEntries.sort((a, b) => b[1] - a[1])

    // 3) keep only effectiveTopN  ✅ FIXED
    const top = sorted.slice(0, Math.max(0, effectiveTopN))
    const hidden = sorted.slice(top.length)

    // totals for note
    const totalAll = allEntries.reduce((s, [, v]) => s + v, 0)
    const totalShown = top.reduce((s, [, v]) => s + v, 0)
    const hiddenCount = totalAll - totalShown
    const hiddenCats = hidden.length

    // 4) compute % of shown subset so bar = 100%
    const stages = top.map(([label, count], idx) => {
        const percent = totalShown > 0 ? Number(((count / totalShown) * 100).toFixed(1)) : 0
        return {
            id: label,
            label,
            count,
            percent,
            shade: SHADE_CLASSES[idx % SHADE_CLASSES.length],
        }
    })

    return (
        <Card className={cn("w-full h-full", className)}>
            <CardHeader>
                <CardTitle className="text-balance">{title}</CardTitle>
                <CardDescription className="text-pretty">
                    {description}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Stacked bar for topN only */}
                <div className="w-full">
                    <div
                        className="h-3 w-full overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label="Diagnosis mix (top categories)"
                    >
                        <div className="flex h-full w-full">
                            {stages.map((s) => (
                                <div
                                    key={s.id}
                                    className={cn("h-full", s.shade)}
                                    style={{ width: `${s.percent}%` }}
                                    aria-hidden="true"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Legend / rows */}
                <div className="space-y-5">
                    {stages.map((s) => (
                        <div key={s.id} className="flex items-start justify-between gap-4">
                            {/* Left */}
                            <div className="flex items-start gap-3">
                                <span
                                    className={cn(
                                        "mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-border",
                                        s.shade
                                    )}
                                />
                                <div>
                                    <div className="text-sm font-medium leading-none">{s.label}</div>
                                    <div className="mt-1 text-xs text-muted-foreground">{s.count} cases</div>
                                </div>
                            </div>

                            {/* Right */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="relative h-2 w-24 rounded-full bg-muted md:w-32"
                                    role="progressbar"
                                    aria-label={`${s.label} share (shown subset)`}
                                    aria-valuenow={s.percent}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                >
                                    <div
                                        className={cn("absolute left-0 top-0 h-2 rounded-full", s.shade)}
                                        style={{ width: `${s.percent}%` }}
                                    />
                                </div>
                                <span className="min-w-10 text-right text-sm text-muted-foreground">
                                    {s.percent}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            {showHiddenNote && hiddenCats > 0 && (
                <CardDescription className="text-xs text-muted-foreground px-6 pb-4 pt-0">
                    + {hiddenCats} other {hiddenCats === 1 ? "category" : "categories"} ({hiddenCount} cases) not shown
                </CardDescription>
            )}
        </Card>
    )
}

export default DiagnosisMixCard
