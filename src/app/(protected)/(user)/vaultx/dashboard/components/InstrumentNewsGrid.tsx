"use client"

import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Headline = {
  id: string
  title: string
  sentiment: "positive" | "negative" | "neutral"
  sentimentScore: number
  timestamp: string
  source: string
  link: string
}

type InstrumentCard = {
  instrument: string
  symbol: string
  sentiment: string
  sentimentScore: number
  headlines: Headline[]
}

interface InstrumentNewsGridProps {
  data: InstrumentCard[]
}

export function InstrumentNewsGrid({ data }: InstrumentNewsGridProps) {
  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getSentimentStyle = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return {
          bg: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950",
          badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          icon: TrendingUp,
          color: "text-green-600 dark:text-green-400",
        }
      case "negative":
        return {
          bg: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950",
          badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          icon: TrendingDown,
          color: "text-red-600 dark:text-red-400",
        }
      default:
        return {
          bg: "bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-900",
          badge: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
          icon: Minus,
          color: "text-slate-600 dark:text-slate-400",
        }
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Market Headlines</h2>
        <p className="text-sm text-muted-foreground">Latest news from {data.length} instruments • Updated now</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((instrument) => {
          const topHeadline = instrument.headlines?.[0]
          if (!topHeadline) return null

          const style = getSentimentStyle(topHeadline.sentiment)
          const SentimentIcon = style.icon

          return (
            <a
              key={instrument.symbol}
              href={topHeadline.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card
                className={`h-full transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 cursor-pointer ${style.bg}`}
              >
                <CardContent className="p-5 h-full flex flex-col justify-between space-y-4">
                  {/* Top Section: Instrument Badge & Sentiment */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <h3 className="font-bold text-foreground text-sm">{instrument.instrument}</h3>
                      <span className="inline-block px-2.5 py-1 bg-background/60 text-foreground text-xs font-mono font-semibold rounded">
                        {instrument.symbol}
                      </span>
                    </div>

                    {/* Sentiment Badge */}
                    <Badge className={`${style.badge} flex items-center gap-1 whitespace-nowrap`}>
                      <SentimentIcon className="w-3 h-3" />
                      <span className="capitalize text-xs">{topHeadline.sentiment}</span>
                    </Badge>
                  </div>

                  {/* Headline */}
                  <div className="flex-1 space-y-2">
                    <h4 className="text-foreground font-semibold text-sm leading-snug line-clamp-3 group-hover:line-clamp-none transition-all">
                      {topHeadline.title}
                    </h4>
                  </div>

                  {/* Footer: Source & Time */}
                  <div className="flex items-center justify-between pt-3 border-t border-background/30">
                    <span className="text-xs text-muted-foreground font-medium">{topHeadline.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{formatDate(topHeadline.timestamp)}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          )
        })}
      </div>
    </div>
  )
}
