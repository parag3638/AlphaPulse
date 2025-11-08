"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Minus, TrendingDown } from "lucide-react"
import type { Event } from "@/lib/types"
import type { FC } from "react"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: Event
}

const IMPACT_COLORS = {
  high: "destructive",
  medium: "secondary",
  low: "default",
} as const

const IMPACT_BADGE_CLASSES = {
  high: "bg-red-500/10 text-red-600 dark:text-red-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  low: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
} as const

const TYPE_BADGE_CLASSES = {
  macro: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  earnings: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  crypto: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  other: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
} as const

const MARKET_BADGE_CLASSES = {
  US: "border-blue-500/40 text-blue-600 dark:text-blue-300",
  UK: "border-indigo-500/40 text-indigo-600 dark:text-indigo-300",
  EU: "border-cyan-500/40 text-cyan-600 dark:text-cyan-300",
  IN: "border-amber-500/40 text-amber-600 dark:text-amber-300",
  GLOBAL: "border-lime-500/40 text-lime-600 dark:text-lime-300",
  other: "border-muted text-muted-foreground",
} as const

const SYMBOL_BADGE_CLASSES = [
  "border-pink bg-pink text-pink",
  "border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-300",
  "border-purple-500/40 bg-purple-500/5 text-purple-600 dark:text-purple-300",
  "border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-300",
] as const

const TREND_ICONS = {
  rising: TrendingUp,
  flat: Minus,
  falling: TrendingDown,
}

const getSentimentColor = (score: number) => {
  if (score > 0.6) return "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/40"
  if (score > 0.2) return "bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
  if (score > -0.2) return "bg-slate-500/5 text-slate-700 dark:text-slate-300 border-slate-500/30"
  if (score > -0.6) return "bg-rose-500/5 text-rose-600 dark:text-rose-300 border-rose-500/30"
  return "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/40"
}

const getSentimentLabel = (score: number | null) => {
  if (score === null) return "No data"
  if (score > 0.6) return "Strong bullish"
  if (score > 0.2) return "Bullish"
  if (score > -0.2) return "Neutral"
  if (score > -0.6) return "Bearish"
  return "Strong bearish"
}

export const EventCard: FC<EventCardProps> = ({ event }) => {
  const TrendIcon = TREND_ICONS[event.trend as keyof typeof TREND_ICONS]
  const sentimentScore = typeof event.score === "number" ? event.score : null
  const actualValue = typeof event.actual === "number" ? event.actual : null
  const impactKey = event.impact as keyof typeof IMPACT_COLORS
  const normalizedType = event.type?.toString().toLowerCase()
  const typeKey =
    normalizedType && normalizedType in TYPE_BADGE_CLASSES
      ? (normalizedType as keyof typeof TYPE_BADGE_CLASSES)
      : "other"
  const normalizedMarket = event.market?.toString().toUpperCase()
  const marketKey =
    normalizedMarket && normalizedMarket in MARKET_BADGE_CLASSES
      ? (normalizedMarket as keyof typeof MARKET_BADGE_CLASSES)
      : "other"
  const sentimentLabel = getSentimentLabel(sentimentScore)
  const localTime = new Date(event.datetime_utc).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  })

  return (
    <Card className="group overflow-hidden border border-border/60 bg-card/90 transition-transform duration-100 ease-out hover:-translate-y-0.5 hover:scale-[1.010] hover:shadow-xl">
      <div className="space-y-4 p-6">
        {/* Header with Title and Badges */}
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-lg font-semibold group-hover:text-primary">{event.title}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={IMPACT_COLORS[impactKey]}
              className={cn("capitalize", IMPACT_BADGE_CLASSES[impactKey])}
            >
              {event.impact}
            </Badge>
            <Badge
              variant="outline"
              className={cn("uppercase tracking-wide", MARKET_BADGE_CLASSES[marketKey])}
            >
              {event.market}
            </Badge>
            <Badge
              variant="secondary"
              className={cn("capitalize", TYPE_BADGE_CLASSES[typeKey])}
            >
              {event.type}
            </Badge>
          </div>
        </div>

        {/* Time Info */}
        <div className="text-sm">
          <p className="font-medium">{localTime}</p>
          {/* <p className="text-xs text-muted-foreground">{event.datetime_utc}</p> */}
        </div>

        {/* Sentiment */}
        <div
          className={cn(
            "rounded-lg border px-3 py-2 shadow-sm",
            getSentimentColor(sentimentScore ?? 0)
          )}
        >
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-current/70">
            <span>Sentiment</span>
            <span>{sentimentLabel}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-base font-semibold text-current">
            {TrendIcon && <TrendIcon className="h-4 w-4" />}
            <span>
              {sentimentScore !== null ? (
                <>
                  {sentimentScore > 0 ? "+" : ""}
                  {sentimentScore.toFixed(2)}
                </>
              ) : (
                "N/A"
              )}
            </span>
          </div>
        </div>

        {/* Forecast/Actual Row */}
        {(event.forecast !== undefined || event.actual !== undefined || event.previous !== undefined) && (
          <div className="space-y-1 text-xs">
            {event.forecast !== null && (
              <p className="text-muted-foreground">
                Forecast:{" "}
                <span className="font-medium text-foreground">
                  {event.forecast}
                  {event.unit ? ` ${event.unit}` : ""}
                </span>
              </p>
            )}
            {event.previous !== null && (
              <p className="text-muted-foreground">
                Previous:{" "}
                <span className="font-medium text-foreground">
                  {event.previous}
                  {event.unit ? ` ${event.unit}` : ""}
                </span>
              </p>
            )}
            {actualValue !== null && (
              <p className="text-muted-foreground">
                Actual:{" "}
                <span
                  className={`font-medium ${actualValue > 0 ? "text-green-600" : actualValue < 0 ? "text-red-600" : "text-foreground"}`}
                >
                  {actualValue}
                  {event.unit ? ` ${event.unit}` : ""}
                </span>
              </p>
            )}
          </div>
        )}

        {/* Symbols */}
        {event.symbols.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {event.symbols.slice(0, 4).map((symbol, idx) => (
              <Badge
                key={symbol}
                variant="outline"
                className={cn(
                  "text-[10px] uppercase tracking-wide",
                  SYMBOL_BADGE_CLASSES[idx % SYMBOL_BADGE_CLASSES.length]
                )}
              >
                {symbol}
              </Badge>
            ))}
            {event.symbols.length > 4 && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                +{event.symbols.length - 4}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
