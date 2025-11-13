"use client"

import { ExternalLink, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type HeadlineData = {
  instrument: string
  symbol: string
  sentiment: "positive" | "negative" | "neutral"
  headlines: {
    id: string
    title: string
    sentiment: string
    timestamp: string
    source: string
    link: string
  }[]
}

export function InstrumentHeadlinesCard({
  data,
}: {
  data: HeadlineData[]
}) {
  const allHeadlines = data
    .map((item) => {
      if (!item.headlines.length) return null
      const latestHeadline = item.headlines.reduce((latest, current) =>
        new Date(current.timestamp).getTime() > new Date(latest.timestamp).getTime() ? current : latest,
      )
      return {
        instrument: item.instrument,
        symbol: item.symbol,
        sentiment: item.sentiment,
        headline: latestHeadline,
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => new Date(b.headline.timestamp).getTime() - new Date(a.headline.timestamp).getTime())
    .slice(0, 4)

  return (
    <Card className="rounded-lg border shadow-sm h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Market Headlines</CardTitle>
          <span className="text-xs text-muted-foreground">Top recent news</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          {allHeadlines.map((item) => {
            const sentimentKey = (item.headline.sentiment || item.sentiment || "neutral").toLowerCase()
            const sentimentConfig = {
              positive: { Icon: TrendingUp, color: "text-green-600" },
              negative: { Icon: TrendingDown, color: "text-red-600" },
              neutral: { Icon: Activity, color: "text-amber-600" },
            } as const
            const { Icon, color } = sentimentConfig[sentimentKey as keyof typeof sentimentConfig] ?? sentimentConfig.neutral

            return (
              <a
                key={item.headline.id}
                href={item.headline.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3 rounded-lg border border-border/50 bg-muted/30 p-3 hover:bg-muted/60 transition-colors"
              >
                {/* Instrument column */}
                <div className="flex flex-col gap-1 min-w-fit">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs">{item.symbol}</span>
                    {Icon && (
                      <Icon
                        className={`h-4 w-4 ${color
                          }`}
                      />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{item.instrument}</span>
                </div>

                {/* Headline content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                    {item.headline.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-xs">
                      {item.headline.source}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{relativeTime(item.headline.timestamp)}</span>
                  </div>
                </div>

                {/* External link icon */}
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function relativeTime(iso: string) {
  const d = new Date(iso)
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const day = Math.floor(h / 24)
  if (s < 60) return `${s}s ago`
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${day}d ago`
}
