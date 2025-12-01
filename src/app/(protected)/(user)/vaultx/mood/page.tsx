"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Newspaper, RefreshCw, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type Headline = {
    id: string | number
    title: string
    sentiment: string
    timestamp: string
    source: string
    summary: string
    link?: string
}

type InstrumentData = {
    instrument: string
    symbol: string
    sentiment: string
    sentimentScore: number
    trend: number[]
    headlines: Headline[]
    summary: string
}

type AssetCategory = "Equities" | "Forex" | "Crypto"

export default function MarketMoodPage() {
    const [data, setData] = useState<InstrumentData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedInstrument, setSelectedInstrument] = useState<InstrumentData | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const [detail, setDetail] = useState<InstrumentData | null>(null)
    const [activeCategory, setActiveCategory] = useState<AssetCategory>("Equities")

    const API_BASE = useMemo(() => process.env.NEXT_PUBLIC_API_BASE || "https://authbackend-cc2d.onrender.com", [])

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case "positive":
                return "bg-emerald-50 text-emerald-700 border-emerald-200"
            case "negative":
                return "bg-red-50 text-red-700 border-red-200"
            case "neutral":
                return "bg-amber-50 text-amber-700 border-amber-200"
            default:
                return "bg-slate-50 text-slate-700 border-slate-200"
        }
    }

    const getSentimentBgColor = (sentiment: string) => {
        switch (sentiment) {
            case "positive":
                return "border-l-emerald-500"
            case "negative":
                return "border-l-red-500"
            case "neutral":
                return "border-l-amber-500"
            default:
                return "border-l-slate-500"
        }
    }

    const currencyCodes = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD", "CNY", "INR", "SGD", "HKD"]
    const cryptoHints = ["BTC", "ETH", "SOL", "XRP", "ADA", "DOGE", "BNB", "MATIC", "DOT", "AVAX", "LTC"]

    const isCryptoSymbol = (symbol?: string, instrumentName?: string) => {
        const value = `${symbol ?? ""} ${instrumentName ?? ""}`.toUpperCase()
        return cryptoHints.some((hint) => value.includes(hint)) || value.includes("CRYPTO")
    }

    const isForexSymbol = (symbol?: string, instrumentName?: string) => {
        const normalized = symbol?.toUpperCase() ?? ""
        const compact = normalized.replace(/[-/]/g, "")
        const looksLikePair = compact.length === 6
        const hasSlash = normalized.includes("/")

        if (hasSlash) return true
        if (looksLikePair) {
            const base = compact.slice(0, 3)
            const quote = compact.slice(3, 6)
            return currencyCodes.includes(base) && currencyCodes.includes(quote)
        }
        return instrumentName?.toLowerCase().includes("forex") ?? false
    }

    const categorizeInstrument = (instrument: InstrumentData): AssetCategory => {
        if (isCryptoSymbol(instrument.symbol, instrument.instrument)) return "Crypto"
        if (isForexSymbol(instrument.symbol, instrument.instrument)) return "Forex"
        return "Equities"
    }

    const sectionOrder: AssetCategory[] = ["Equities", "Forex", "Crypto"]

    const categorizedData = useMemo(() => {
        const grouped: Record<AssetCategory, InstrumentData[]> = { Equities: [], Forex: [], Crypto: [] }
        data.forEach((item) => {
            const category = categorizeInstrument(item)
            grouped[category].push(item)
        })
        return grouped
    }, [data])

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        if (minutes < 60) return `${minutes}m ago`
        if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
        return date.toLocaleDateString()
    }

    const fetchSnapshots = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const { data } = await axios.get<InstrumentData[]>(`${API_BASE}/mood/snapshots`, {
                params: { limitTopHeadlines: 4, returnTrend: false, _ts: Date.now() },
                withCredentials: true,
            })
            setData(data)
        } catch (e: any) {
            console.error(e)
            setError("Failed to load market mood.")
            setData([])
        } finally {
            setLoading(false)
        }
    }, [API_BASE])

    useEffect(() => {
        fetchSnapshots()
    }, [fetchSnapshots])

    useEffect(() => {
        const loadDetail = async () => {
            if (!selectedInstrument?.symbol) return
            setDetailLoading(true)
            try {
                const { data } = await axios.get(`${API_BASE}/mood/instruments/${selectedInstrument.symbol}`, {
                    params: { includeTrend: true, limitHeadlines: 6, _ts: Date.now() },
                    withCredentials: true,
                })
                setDetail(data)
            } catch (e) {
                console.error(e)
                setDetail(null)
            } finally {
                setDetailLoading(false)
            }
        }
        if (selectedInstrument) loadDetail()
    }, [selectedInstrument, API_BASE])

    if (loading) {
        return (
            <div className="min-h-screen p-4 md:p-8">
                <Tabs
                    defaultValue="Equities"
                    value={activeCategory}
                    onValueChange={(v) => setActiveCategory(v as AssetCategory)}
                    className="w-full"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                        <div>
                            <h1 className="text-5xl font-bold text-slate-900 mb-2 tracking-tight">Market Mood</h1>
                            <p className="text-slate-600">Real-time financial news sentiment analysis</p>
                        </div>
                        <div className="flex space-x-3 items-center">
                            <Button
                                onClick={fetchSnapshots}
                                disabled
                                className="gap-2 text-white shadow-md"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                    {error && (
                        <div className="mb-4 text-sm text-red-700 border border-red-200 bg-red-50 rounded-lg p-3">{error}</div>
                    )}
                    <TabsList className="grid grid-cols-3 w-1/6 max-w-[240px] bg-white border border-slate-200 rounded-lg p-1 mb-5 shadow-sm">
                        {sectionOrder.map((category) => (
                            <TabsTrigger
                                key={category}
                                value={category}
                                className="dark text-slate-700 rounded-md pb-1"
                            >
                                {category}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={`loading-${i}`} className="h-64 border-slate-200 bg-white shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-5 w-32 bg-slate-200" />
                                            <Skeleton className="h-4 w-20 bg-slate-200" />
                                        </div>
                                        <Skeleton className="h-6 w-16 rounded-md bg-slate-200" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Skeleton className="h-3 w-full bg-slate-200" />
                                    <Skeleton className="h-3 w-2/3 bg-slate-200" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </Tabs>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 md:p-8">

            <Tabs
                defaultValue="Equities"
                value={activeCategory}
                onValueChange={(v) => setActiveCategory(v as AssetCategory)}
                className="w-full"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="mb-4">
                        <h1 className="text-5xl font-bold text-slate-900 mb-2 tracking-tight">Market Mood</h1>
                        <p className="text-slate-600">Real-time financial news sentiment analysis</p>
                    </div>

                    <div className="flex space-x-3 items-center">
                        <Button
                            onClick={fetchSnapshots}
                            disabled={loading}
                            className="gap-2 text-white shadow-md"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {error && <div className="mb-6 text-sm text-red-700 border border-red-200 bg-red-50 rounded-lg p-4">{error}</div>}

                <TabsList className="grid grid-cols-3 w-1/6 max-w-[240px] bg-white border border-slate-200 rounded-lg p-1 mb-5 shadow-sm">
                    {sectionOrder.map((category) => (
                        <TabsTrigger
                            key={category}
                            value={category}
                            className="dark text-slate-700 rounded-md pb-1"
                        >
                            {category}
                        </TabsTrigger>
                    ))}
                </TabsList>


                {sectionOrder.map((category) => {
                    const instruments = categorizedData[category]
                    return (
                        <TabsContent key={category} value={category} className="space-y-8 mt-0">
                            {instruments.length === 0 ? (
                                <Card className="border-slate-200 bg-white shadow-sm">
                                    <CardContent className="pt-8 pb-8 text-center">
                                        <p className="text-slate-500 text-base">
                                            No {category.toLowerCase()} instruments available right now.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <>
                                    {/* Instruments Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {instruments.map((instrument) => (
                                            <Card
                                                key={instrument.symbol}
                                                className={`cursor-pointer transition-all hover:shadow-lg hover:border-red-200 border-l-4 bg-white border-t border-r border-b border-slate-200 ${getSentimentBgColor(
                                                    instrument.sentiment,
                                                )} group hover:scale-105`}
                                                onClick={() => setSelectedInstrument(instrument)}
                                            >
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1 space-y-1">
                                                            <CardTitle className="text-lg text-slate-900">{instrument.instrument}</CardTitle>
                                                            <p className="text-xs text-slate-500">{instrument.symbol}</p>
                                                        </div>
                                                        <Badge className={`${getSentimentColor(instrument.sentiment)}`}>
                                                            {instrument.sentiment.charAt(0).toUpperCase() + instrument.sentiment.slice(1)}
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-2">
                                                            <Newspaper className="w-4 h-4 text-black" />
                                                            Top Headlines
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {instrument.headlines.slice(0, 2).map((headline) => (
                                                                <div
                                                                    key={headline.id}
                                                                    className="p-2 rounded bg-slate-50 border border-slate-200 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <p className="text-xs font-medium text-slate-800 line-clamp-2">{headline.title}</p>
                                                                    <div className="flex items-center justify-between mt-1 gap-1">
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[10px] bg-white text-slate-600 border-slate-200"
                                                                        >
                                                                            {headline.source}
                                                                        </Badge>
                                                                        <span className="text-[10px] text-slate-500">{formatTime(headline.timestamp)}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="pt-2 border-t border-slate-200">
                                                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{instrument.summary}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                </>
                            )}
                        </TabsContent>
                    )
                })}
            </Tabs>

            <Dialog open={!!selectedInstrument} onOpenChange={(open) => !open && setSelectedInstrument(null)}>
                <DialogContent className="max-w-5xl max-h-[80vh]">
                    <DialogHeader className="pb-4 border-b border-border">
                        <DialogTitle className="flex items-start gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-red-100 to-red-50 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground leading-tight">
                                        {selectedInstrument?.instrument}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedInstrument?.symbol} — Detailed Analysis
                                    </p>
                                </div>
                            </div>
                            {selectedInstrument && (
                                <Badge variant="outline" className={`${getSentimentColor(selectedInstrument.sentiment)} text-xs flex place-self-end -ml-2`}>
                                    {selectedInstrument.sentiment.charAt(0).toUpperCase() + selectedInstrument.sentiment.slice(1)}
                                </Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription className="hidden" />
                    </DialogHeader>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 bg-gradient-to-b from-red-500 to-emerald-500 rounded" />
                                All Headlines
                            </h3>
                            <ScrollArea className="h-[42vh] pr-4">
                                <div className="space-y-3">
                                    {detailLoading
                                        ? Array.from({ length: 4 }).map((_, idx) => (
                                            <Skeleton key={idx} className="h-24 bg-muted rounded-lg" />
                                        ))
                                        : (detail?.headlines ?? selectedInstrument?.headlines ?? []).map((headline) => (
                                            <div
                                                key={headline.id}
                                                className={`p-4 rounded-lg border border-l-4 ${getSentimentBgColor(
                                                    headline.sentiment,
                                                )} bg-muted/30 hover:shadow-md transition-shadow space-y-2 border-border`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-semibold text-foreground text-sm leading-tight flex-1">
                                                        {headline.title}
                                                    </h4>
                                                    <Badge variant="outline" className={`${getSentimentColor(headline.sentiment)} flex-shrink-0`}>
                                                        {headline.sentiment.charAt(0).toUpperCase() + headline.sentiment.slice(1)}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{headline.summary}</p>
                                                <div className="flex items-center justify-between pt-2 gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {headline.source}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatTime(headline.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </ScrollArea>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-red-500 rounded" />
                                Market Summary
                            </h3>
                            {detailLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-4 bg-muted rounded" />
                                    <Skeleton className="h-4 bg-muted rounded" />
                                    <Skeleton className="h-4 bg-muted rounded" />
                                </div>
                            ) : (
                                <div className="bg-gradient-to-br from-emerald-50 to-red-50 rounded-lg p-4 border border-emerald-100">
                                    <p className="text-sm text-foreground leading-relaxed">
                                        {detail?.summary ?? selectedInstrument?.summary ?? "—"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
