"use client"

import { useState, useEffect, useCallback } from "react"
import axios, { AxiosError } from "axios"
import { motion } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, AlertCircle } from "lucide-react"
import { KeyStat } from "./KeyStat"
import { BarTable } from "./BarTable"
import { Tags } from "./Tags"
import { fmtPrice, fmtPct, timeAgo } from "@/lib/format"
import { getCookie } from "@/lib/cookies"

export type PriceBar1m = {
  ts: string
  open: number
  high: number
  low: number
  close: number
  volume: number | null
}

export type PriceDetailResponse = {
  symbol: string
  name: string
  asset: string
  exchange: string | null
  rows: PriceBar1m[]
  last_close: number | null
  prev_close: number | null
  change: number | null
  change_pct: number | null
  last_close_dt: string | null
}

interface InstrumentDetailDialogProps {
  symbol: string
  updated?: string | undefined
}

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000").replace(/\/$/, "");


export function InstrumentDetailDialog({ symbol, updated }: InstrumentDetailDialogProps) {
  const [detail, setDetail] = useState<PriceDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetail = useCallback(
    async ({ signal, resetDetail }: { signal?: AbortSignal; resetDetail?: boolean } = {}) => {
      if (!symbol) {
        setDetail(null)
        setError("Symbol is required")
        return
      }

      if (resetDetail) {
        setDetail(null)
      }

      setLoading(true)
      setError(null)

      try {
        const response = await axios.get(`${API_BASE}/prices/detail`, {
          params: { symbol },
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": getCookie("csrf_token") ?? "",
          },
        });

        if (!response?.data) {
          throw new Error("Invalid response received")
        }

        setDetail(response.data)
      } catch (err) {
        if ((err as DOMException)?.name === "AbortError") {
          return
        }

        if (axios.isAxiosError(err)) {
          const axiosErr = err as AxiosError<{ error?: string }>
          const message =
            axiosErr.response?.data?.error ||
            axiosErr.message ||
            "Failed to load instrument details"
          console.error("Failed to load instrument details", err)
          setError(message)
        } else {
          console.error("Failed to load instrument details", err)
          setError(err instanceof Error ? err.message : "Failed to load instrument details")
        }
        setDetail(null)
      } finally {
        if (!signal?.aborted) {
          setLoading(false)
        }
      }
    },
    [symbol],
  )

  useEffect(() => {
    if (!symbol) {
      return
    }

    const controller = new AbortController()
    fetchDetail({ signal: controller.signal, resetDetail: true })

    return () => controller.abort()
  }, [fetchDetail, symbol])


  const isPositive = (detail?.change_pct ?? 0) >= 0

  return (
    <>
      {loading ? (
        <div className="p-8">
          <Skeleton className="h-12 w-48 mb-4" />
          <Skeleton className="h-40 w-full mb-6" />
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => fetchDetail()}>
            Try Again
          </Button>
        </div>
      ) : detail ? (
        <>
          {/* Header */}
          <div className="px-8 py-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold">{detail.symbol}</h1>
                <p className="text-sm text-muted-foreground mt-1">{detail.name}</p>
                <div className="pt-3">
                  <Tags
                    exchange={detail.exchange}
                    asset={detail.asset as "index" | "equity" | "crypto" | "forex"}
                  />
                </div>
              </div>

              {/* Price + change */}
              <div className="text-right">
                {/* current price */}
                <p className="text-2xl font-semibold">
                  {getCurrencySymbol(detail.asset, detail.exchange)}
                  {detail.last_close != null
                    ? Number(detail.last_close).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                    : "—"}
                </p>

                {/* change + percent */}
                <div
                  className={`mt-1 inline-flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium ${detail.change != null && detail.change > 0
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : detail.change != null && detail.change < 0
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-muted text-muted-foreground"
                    }`}
                >
                  {fmtPct(detail.change_pct)}{" "}
                  ({detail.change != null
                    ? `${detail.change > 0 ? "+" : ""}${getCurrencySymbol(
                      detail.asset,
                      detail.exchange
                    )}${Math.abs(detail.change).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                    : "—"})
                </div>

                {/* time */}
                <p className="mt-2 text-xs text-muted-foreground">
                  as of {timeAgo(updated)}
                </p>
              </div>
            </div>

            <Separator />
          </div>



          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-8 py-2"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              <KeyStat label="Open" value={fmtPrice(detail.rows[detail.rows.length - 1]?.open)} />
              <KeyStat label="High" value={fmtPrice(detail.rows[detail.rows.length - 1]?.high)} />
              <KeyStat label="Low" value={fmtPrice(detail.rows[detail.rows.length - 1]?.low)} />
              <KeyStat label="Close" value={fmtPrice(detail.rows[detail.rows.length - 1]?.close)} />
              <KeyStat
                label="Volume"
                value={
                  (() => {
                    const lastRow = detail.rows[detail.rows.length - 1];
                    return lastRow && typeof lastRow.volume === "number"
                      ? (lastRow.volume / 1000000).toFixed(2) + "M"
                      : null;
                  })()
                }
              />
              <KeyStat label="Prev Close" value={fmtPrice(detail.prev_close)}
              // hint={detail.last_close_dt ?? undefined}
              />
            </div>

            <Separator className="mt-10" />
          </motion.div>



          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-8 py-3"
          >
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="intraday">Finer Price Tracking</TabsTrigger>
                <TabsTrigger value="daily">Daily</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Exchange</p>
                    <p className="mt-1 font-medium">{detail.exchange || "—"}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Asset Type</p>
                    <p className="mt-1 font-medium capitalize">{detail.asset}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Last Update</p>
                    <p className="mt-1 font-medium">{detail.last_close_dt}</p>
                  </div>
                </div>

                <div className="flex felx-col justify-between items-center">

                  <p className="text-xs text-muted-foreground">Data: 1m snapshot</p>

                  <Button variant="outline" onClick={() => fetchDetail()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>

                </div>

              </TabsContent>

              <TabsContent value="intraday" className="space-y-6">
                <div>
                  <h3 className="mb-4 font-semibold">Last 50 Bars</h3>
                  <BarTable rows={detail.rows} />
                </div>
              </TabsContent>

              <TabsContent value="daily" className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/20 p-6 text-center">
                  <p className="text-sm text-muted-foreground">Daily series coming soon</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <KeyStat label="Last Close" value={fmtPrice(detail.last_close)} />
                  <KeyStat label="Prev Close" value={fmtPrice(detail.prev_close)} />
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </>
      ) : null}
    </>
  )
}


function getCurrencySymbol(asset?: string | null, exchange?: string | null) {
  if (!asset && !exchange) return "";
  if (asset === "crypto") return "$";
  if (asset === "forex" || exchange === "FX") return "₹"; // adjust for your default base
  if (exchange === "NSE") return "₹";
  return "$"; // fallback
}
