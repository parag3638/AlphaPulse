"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"
import { AlertCircleIcon, Timer, CircleAlert, HeartPulse, Bell, CalendarDays, TrendingUp, BarChart3 } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { ChartBarBuckets } from "./components/BarChart";
import StatusPie from "./components/ProductWiseAlert";
import { Skeleton } from "@/components/ui/skeleton";
import DiagnosisMixCard from "./components/PipelineCard";
import ActiveCasesCard from "./components/CaseCard";
import { ChartLineLinear } from "./components/LineChart";
import AreaChartInt from "./components/AreaChart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ChartSentimentHistogram } from "./components/ChartSentimentHistogram";
import { InstrumentHeadlinesCard } from "./components/InstrumentHeadlinesCard";
import ProductWiseAlert from "./components/ProductWiseAlert";

const timeRangeOptions = [
    { value: "HDFCBANK", label: "HDFC BANK" },
    { value: "TCS", label: "TCS" },
    { value: "INFY", label: "Infosys Ltd" },
    { value: "RELIANCE", label: "Reliance" },
    { value: "ICICIBANK", label: "ICICI BANK" },
    { value: "BTCUSDT", label: "Bitcoin" },
    { value: "ETHUSDT", label: "Ethereum" },
    { value: "EURINR", label: "EUR/INR" },
    { value: "USDINR", label: "USD/INR" },
]

type PriceRow = {
    ts: string
    open: number
    high: number
    low: number
    close: number
    volume: number | null
}

type PriceDetail = {
    symbol: string
    name: string
    asset: string
    exchange: string
    rows: PriceRow[]
    last_close: number
    prev_close: number
    change: number
    change_pct: number
    last_close_dt: string
}


export default function DashboardPage() {
    const [data, setData] = useState<any>(null);
    const [chart, setChart] = useState<any>(null);
    const [overviewLoading, setOverviewLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // const [displayName, setDisplayName] = useState("")
    const [selectedSymbol, setSelectedSymbol] = useState(timeRangeOptions[0].value)
    const hasLoadedOverview = useRef(false)

    // useEffect(() => {
    //     let cancelled = false
    //         ; (async () => {
    //             try {
    //                 setChartLoading(true)
    //                 if (!hasLoadedOverview.current) {
    //                     setOverviewLoading(true)
    //                 }
    //                 setError(null)
    //                 const [detailRes, overviewRes] = await Promise.all([
    //                     // axios.get<PriceDetail>("http://localhost:9000/finance/detail/daily", {
    //                     axios.get<PriceDetail>("https://authbackend-cc2d.onrender.com/finance/detail/daily", {
    //                         params: { symbol: selectedSymbol },
    //                         withCredentials: true,
    //                         // headers: { "Cache-Control": "no-store" },
    //                     }),
    //                     // axios.get("http://localhost:9000/finance/overview", {
    //                     axios.get("https://authbackend-cc2d.onrender.com/finance/overview", {
    //                         withCredentials: true,
    //                         // headers: { "Cache-Control": "no-store" },
    //                     }),
    //                 ])
    //                 if (!cancelled) {
    //                     setChart(detailRes.data)
    //                     setData(overviewRes.data)
    //                     hasLoadedOverview.current = true
    //                 }
    //             } catch (err: any) {
    //                 if (!cancelled) setError(err?.message || "Failed to load")
    //             } finally {
    //                 if (!cancelled) {
    //                     setChartLoading(false)
    //                     setOverviewLoading(false)
    //                 }
    //             }
    //         })()
    //     return () => {
    //         cancelled = true
    //     }
    // }, [selectedSymbol])


    useEffect(() => {
        let cancelled = false

            ; (async () => {
                try {
                    setOverviewLoading(true)
                    setError(null)

                    const overviewRes = await axios.get("https://authbackend-cc2d.onrender.com/finance/overview", {
                        withCredentials: true,
                    })

                    if (!cancelled) {
                        setData(overviewRes.data)
                        hasLoadedOverview.current = true
                    }
                } catch (err: any) {
                    if (!cancelled) setError(err?.message || "Failed to load overview")
                } finally {
                    if (!cancelled) {
                        setOverviewLoading(false)
                    }
                }
            })()

        return () => {
            cancelled = true
        }
    }, [])  // <--- NO selectedSymbol here


    useEffect(() => {
        let cancelled = false

            ; (async () => {
                try {
                    setChartLoading(true)
                    setError(null)

                    const detailRes = await axios.get<PriceDetail>(
                        "https://authbackend-cc2d.onrender.com/finance/detail/daily",
                        {
                            params: { symbol: selectedSymbol },
                            withCredentials: true,
                        }
                    )

                    if (!cancelled) {
                        setChart(detailRes.data)
                    }
                } catch (err: any) {
                    if (!cancelled) setError(err?.message || "Failed to load chart")
                } finally {
                    if (!cancelled) {
                        setChartLoading(false)
                    }
                }
            })()

        return () => {
            cancelled = true
        }
    }, [selectedSymbol])

    
    const displayName = chart?.name ?? selectedSymbol

    const chartData = useMemo(() => {
        if (!chart?.rows?.length) return []

        const dailyMap = new Map<string, { ts: string; close: number }>()

        chart.rows.forEach((r: any) => {
            const day = r.ts.split("T")[0]
            const existing = dailyMap.get(day)
            if (!existing || new Date(r.ts) > new Date(existing.ts)) {
                dailyMap.set(day, { ts: r.ts, close: r.close ?? r.open ?? 0 })
            }
        })

        return Array.from(dailyMap.entries())
            .map(([day, obj]) => ({ date: obj.ts, price: obj.close }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }, [chart])



    const getValue = (obj: any, path: any, def: any) =>
        path.split(/[.[\]]+/).filter(Boolean).reduce((o: any, p: any) => o?.[p], obj) ?? def;

    const currencySymbol = ((chart?.asset || "").toLowerCase() === "crypto") ? "$" : "₹"
    const changeValue = typeof chart?.change === "number" ? chart.change : null
    const changeSign = changeValue === null ? "" : changeValue >= 0 ? "+" : ""
    const changeColor = changeValue === null ? "text-muted-foreground" : changeValue >= 0 ? "text-emerald-600" : "text-red-600"

    // Build slices with stable order High → Medium → Low
    const impactSlices = useMemo(() => {
        const arr = (data?.charts?.impactMix ?? []).map(
            (d: { name: string; value: number }) => ({
                status: d.name.toLowerCase(),     // "high" | "medium" | "low"
                count: Number(d.value ?? 0),
            })
        )
        const ORDER = ["high", "medium", "low"]
        return arr.sort(
            (a: any, b: any) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status)
        )
    }, [data?.charts?.impactMix])



    if (error) {
        return (
            <div className="w-full pt-4 flex justify-center text-center text-sm text-destructive">
                Error loading dashboard: <span className="ml-1 font-medium">{error}</span>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Container pinned to 2xl to preserve comfy sizing */}
            <div className="mx-auto px-3 sm:px-4 pb-6 space-y-5">

                {/* ---------- KPI + CHARTS ---------- */}
                <div className="grid gap-4
                        grid-cols-1
                        md:grid-cols-2
                        xl:grid-cols-12">
                    {/* KPIs (full on sm, 2-up on md, 4-up on xl/2xl) */}
                    {[
                        { title: "Total Instruments", icon: BarChart3, key: "prices[tracked]", footer: "actively tracked" },
                        { title: "Upcoming Events", icon: CalendarDays, key: "calendar[total]", footer: "over next 30 days" },
                        { title: "Sentiment Momentum", icon: TrendingUp, key: "sentimentMomentum", footer: "% of bullish vs bearish" },
                    ].map((item) => (

                        <Card
                            key={item.key}
                            className="
                                col-span-1
                                md:col-span-1
                                xl:col-span-4
                                min-h-[140px]
                            "
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="px-6 py-2">
                                {overviewLoading ? (
                                    <div className="flex flex-col space-y-2">
                                        <Skeleton className="h-6 w-[100px]" />
                                        <Skeleton className="h-4 w-[140px]" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-2xl font-bold">
                                            {/* {data?.kpis?.[item.key] ?? "--"} */}
                                            {getValue(data?.kpis, item.key, "--")}
                                        </div>
                                        <p className="text-xs text-muted-foreground pt-[1px]">{item.footer}</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}

                    <Separator className="my-1 col-span-1 md:col-span-2 xl:col-span-12" />
                </div>

                {/* ---------- TABLE + PIE ---------- */}
                <div className="grid gap-4
                        grid-cols-1
                        lg:grid-cols-6
                        xl:grid-cols-12">

                    <div className="col-span-1 lg:col-span-6 xl:col-span-12">

                        <Card className="pt-0">
                            <CardHeader className="border-b pb-4">
                                {/* Header top row - title and time selector */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {chartLoading ? (
                                            <div className="space-y-2">
                                                <Skeleton className="h-7 w-48" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        ) : (
                                            <>
                                                {/* Asset Name */}
                                                <CardTitle className="text-2xl font-semibold text-foreground truncate mb-1">
                                                    {displayName}
                                                </CardTitle>

                                                {/* Exchange and Asset Type */}
                                                <p className="text-sm text-muted-foreground">
                                                    {chart ? `${chart.exchange} • ${chart.asset.toUpperCase()}` : "Loading..."}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    <Select
                                        value={selectedSymbol}
                                        onValueChange={(value) => {
                                            setChartLoading(true)
                                            setSelectedSymbol(value)
                                        }}
                                    >
                                        <SelectTrigger className="w-[140px] rounded-lg" aria-label="Select time range">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {timeRangeOptions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                    className="rounded-lg"
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>


                            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                                {chartLoading && (
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Skeleton className="h-6 w-40" />
                                            <Skeleton className="h-4 w-28" />
                                        </div>
                                        <Skeleton className="h-[200px] w-full rounded-xl" />
                                    </div>
                                )}
                                {error && <div className="text-sm text-red-500">{error}</div>}
                                {!chartLoading && !error && (
                                    <>
                                        <CardDescription className="flex">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xl font-semibold text-foreground">{currencySymbol}{(parseFloat(chart?.last_close.toFixed(2))).toLocaleString() ?? "—"}</span>
                                                <span className={`text-sm font-medium ${changeColor}`}>
                                                    {changeSign}
                                                    {chart?.change?.toFixed(2) ?? "—"} ({changeSign}
                                                    {chart?.change_pct?.toFixed(2) ?? "—"}%)
                                                </span>
                                            </div>
                                        </CardDescription>

                                        <AreaChartInt
                                            series={chartData}
                                            meta={{
                                                symbol: chart?.symbol ?? selectedSymbol,
                                                last: chart?.last_close ?? 0,
                                                change: chart?.change ?? 0,
                                                changePct: chart?.change_pct ?? 0,
                                            }}
                                        />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>


                <div className="grid gap-4
                        grid-cols-1
                        lg:grid-cols-2
                        2xl:grid-cols-12">
                    {/* Charts — stack on small, 2-up on md, 3-up on xl/2xl */}
                    {overviewLoading ? (
                        <>
                            <>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Card
                                        key={i}
                                        className={`
                                            col-span-1
                                            md:col-span-1
                                            2xl:col-span-4
                                            min-h-[380px] md:min-h-[380px]
                                            ${i === 3 ? '2xl:hidden' : ''}
                                        `}
                                    >
                                        <CardHeader>
                                            <CardTitle>
                                                <Skeleton className="h-5 w-[200px]" />
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent>
                                            <Skeleton className="h-56 md:h-72 w-full" />
                                        </CardContent>

                                        <CardFooter className="flex-col space-y-2">
                                            <Skeleton className="h-4 w-[240px]" />
                                            <Skeleton className="h-4 w-[180px]" />
                                        </CardFooter>
                                    </Card>
                                ))}
                            </>
                        </>
                    ) : (
                        <>
                            <Card className="col-span-1 md:col-span-1 2xl:col-span-4 min-h-[380px] md:min-h-[380px]">
                                <ChartSentimentHistogram
                                    data={data?.charts?.sentimentHistogram ?? []}   // [{ min, max, count }]
                                    title="News Sentiment Mix"
                                    description="Headlines grouped by sentiment score"
                                    colorVar="var(--chart-4)"
                                    unitLabel="headlines"
                                    decimals={1}                                    // labels like -1.0 to -0.6
                                    className="h-full"
                                    trendText="Stable vs last week"
                                />
                            </Card>

                            <Card className="col-span-1 md:col-span-1 2xl:col-span-4 min-h-[380px] md:min-h-[380px]">
                                <InstrumentHeadlinesCard data={data.news.cards} />
                            </Card>

                            <Card className="col-span-1 md:col-span-1 2xl:col-span-4 min-h-[380px] md:min-h-[380px]">
                                {/* <ChartBarBuckets
                                    data={impactBuckets}
                                    title="Upcoming Events"
                                    description="Events by impact"
                                    colorVar="var(--chart-2)"
                                    className="h-full"
                                /> */}
                                <StatusPie
                                    data={impactSlices}
                                    title="Upcoming Events"
                                    description="Events by impact"
                                    unitLabel="events"
                                    className="h-full"
                                />
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
}
