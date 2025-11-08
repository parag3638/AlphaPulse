"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Newspaper, RefreshCw } from "lucide-react"
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

export default function MarketMoodPage() {
    const [data, setData] = useState<InstrumentData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedInstrument, setSelectedInstrument] = useState<InstrumentData | null>(null)
    const [detail, setDetail] = useState<InstrumentData | null>(null)
    const [detailLoading, setDetailLoading] = useState(false)

    // point directly to your Express API
    const API_BASE = useMemo(() => process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000", [])

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case "positive": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            case "negative": return "bg-red-500/10 text-red-500 border-red-500/20"
            case "neutral": return "bg-amber-500/10 text-amber-500 border-amber-500/20"
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20"
        }
    }
    const getSentimentBgColor = (sentiment: string) => {
        switch (sentiment) {
            case "positive": return "border-l-emerald-500"
            case "negative": return "border-l-red-500"
            case "neutral": return "border-l-amber-500"
            default: return "border-l-slate-500"
        }
    }
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
            const { data } = await axios.get<InstrumentData[]>(
                `${API_BASE}/mood/snapshots`,
                { params: { limitTopHeadlines: 3, returnTrend: false, _ts: Date.now() } }
            )
            setData(data)
        } catch (e: any) {
            console.error(e)
            setError("Failed to load market mood.")
            setData([])
        } finally {
            setLoading(false)
        }
    }, [API_BASE])

    // load grid on mount
    useEffect(() => { fetchSnapshots() }, [fetchSnapshots])

    // load detail whenever dialog opens with a symbol
    useEffect(() => {
        const loadDetail = async () => {
            if (!selectedInstrument?.symbol) return
            setDetailLoading(true)
            try {
                const { data } = await axios.get(`${API_BASE}/mood/instruments/${selectedInstrument.symbol}`, {
                    params: { includeTrend: true, limitHeadlines: 100, _ts: Date.now() }
                })
                // the detail response shape matches InstrumentData closely; map if needed
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
            <div className="min-h-screen bg-background p-2 md:px-4 md:py-0">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">Market Mood</h1>
                    <p className="text-muted-foreground">Real-time financial news sentiment analysis</p>
                </div>
                {error && <div className="mb-4 text-sm text-red-500 border border-red-500/30 bg-red-500/5 rounded p-3">{error}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 9 }).map((_, i) => (<Skeleton key={i} className="h-96 rounded-2xl" />))}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-2 md:px-4 md:pt-2 pb-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">Market Mood</h1>
                    <p className="text-muted-foreground">Real-time financial news sentiment analysis</p>
                </div>
                <Button onClick={fetchSnapshots} disabled={loading} className="gap-2" size="default">
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {error && <div className="mb-4 text-sm text-red-500 border border-red-500/30 bg-red-500/5 rounded p-3">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((instrument, idx) => (
                    <div key={`${instrument.symbol}-${idx}`}>
                        <Card
                            className={`h-full cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-l-4 ${getSentimentBgColor(
                                instrument.sentiment,
                            )} bg-card`}
                            onClick={() => { setSelectedInstrument(instrument); setDetail(null); }}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg text-foreground">{instrument.instrument}</CardTitle>
                                        <p className="text-xs text-muted-foreground mt-1">{instrument.symbol}</p>
                                    </div>
                                    <Badge variant="outline" className={`${getSentimentColor(instrument.sentiment)}`}>
                                        {instrument.sentiment.charAt(0).toUpperCase() + instrument.sentiment.slice(1)}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Newspaper className="w-4 h-4" />
                                        Top Headlines
                                    </h4>
                                    <div className="space-y-2">
                                        {instrument.headlines.slice(0, 3).map((headline) => (
                                            <div key={headline.id} className="p-2 rounded bg-muted/50 border border-border">
                                                <p className="text-xs font-medium text-foreground line-clamp-2">{headline.title}</p>
                                                <div className="flex items-center justify-between mt-1">
                                                    <Badge variant="outline" className="text-xs">{headline.source}</Badge>
                                                    <span className="text-xs text-muted-foreground">{formatTime(headline.timestamp)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-border">
                                    <h4 className="text-sm font-semibold text-foreground mb-2">Driving Today</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{instrument.summary}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Detailed Dialog */}
            <Dialog open={!!selectedInstrument} onOpenChange={(open) => !open && setSelectedInstrument(null)}>
                <DialogContent className="max-w-4xl max-h-[75vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground">
                                    {selectedInstrument?.instrument}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Detailed news analysis {detailLoading ? "(loading…)" : ""}
                                </p>
                            </div>
                            <Badge variant="outline" className={`${getSentimentColor(selectedInstrument?.sentiment || "")}`}>
                                {(selectedInstrument?.sentiment.charAt(0).toUpperCase() || "") + (selectedInstrument?.sentiment.slice(1) || "")}
                            </Badge>
                        </DialogTitle>
                        <DialogDescription className="hidden"></DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[42vh] pr-4">
                        <div className="space-y-4">
                            {detailLoading
                                ? Array.from({ length: 4 }).map((_, idx) => (
                                    <div key={idx} className="p-4 rounded-lg border border-dashed border-border bg-muted/30 space-y-3">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-full" />
                                        <div className="flex items-center justify-between pt-2">
                                            <Skeleton className="h-6 w-16 rounded" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                ))
                                : (detail?.headlines ?? selectedInstrument?.headlines ?? []).map((headline) => (
                                    <div
                                        key={headline.id}
                                        className={`p-4 rounded-lg border border-l-4 ${getSentimentBgColor(
                                            headline.sentiment,
                                        )} bg-muted/30 space-y-2`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-foreground text-sm leading-tight flex-1">{headline.title}</h3>
                                            <Badge variant="outline" className={`${getSentimentColor(headline.sentiment)} flex-shrink-0`}>
                                                {headline.sentiment.charAt(0).toUpperCase() + headline.sentiment.slice(1)}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{headline.summary}</p>
                                        <div className="flex items-center justify-between pt-2">
                                            <Badge variant="outline" className="text-xs">{headline.source}</Badge>
                                            <span className="text-xs text-muted-foreground">{formatTime(headline.timestamp)}</span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </ScrollArea>

                    <div className="border-t border-border pt-4">
                        <h4 className="font-semibold text-foreground mb-2">Market Summary</h4>
                        {detailLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-3/4" />
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {detail?.summary ?? selectedInstrument?.summary ?? "—"}
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
