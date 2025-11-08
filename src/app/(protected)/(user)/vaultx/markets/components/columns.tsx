"use client"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from "./data-table-column-header"
import { ChevronRight, TrendingUp, TrendingDown, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { InstrumentDetailDialog } from "./SideDetailSheetComp/InstrumentDetailDialog"

// If you already have this type, keep yours.
// It should at least include these fields:
export type MarketData = {
  symbol: string
  name: string
  exchange: string | null
  asset: "index" | "equity" | "crypto" | "forex" | string
  last_price: number | null
  last_close: number | null
  prev_close: number | null
  change: number | null
  change_pct: number | null
  last_updated: string | null
  last_close_dt: string | null
}

// ---------- helpers ----------
const fmtPrice = (n?: number | null) =>
  n == null ? "—" : Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })

const getCurrencySymbol = (asset: string | null, exchange: string | null) => {
  if (asset === "crypto") return "$"; // default for USDT pairs
  if (asset === "forex" || exchange === "FX") return "₹"; // you can switch to '$' or '€' based on pair later
  if (exchange === "NSE") return "₹";
  return "";
};


const timeAgo = (iso?: string | null) => {
  if (!iso) return "—"
  const d = new Date(iso)
  if (isNaN(d.getTime())) return "—"
  const diff = Date.now() - d.getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return "Just now"
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  return `${days}d ago`
}

const assetBadgeClasses: Record<string, string> = {
  index: "bg-blue-100 text-blue-700",
  equity: "bg-emerald-100 text-emerald-700",
  crypto: "bg-sky-100 text-sky-800",
  forex: "bg-pink-100 text-pink-800",
}

const textTone = (n: number | null | undefined) =>
  n == null || !Number.isFinite(Number(n))
    ? "text-muted-foreground"
    : Number(n) > 0
      ? "text-emerald-600"
      : Number(n) < 0
        ? "text-rose-600"
        : "text-muted-foreground";

const pctBadgeTone = (n: number | null | undefined) =>
  n == null || !Number.isFinite(Number(n))
    ? "bg-muted text-muted-foreground"
    : Number(n) > 0
      ? "bg-emerald-100 text-emerald-700"
      : Number(n) < 0
        ? "bg-rose-100 text-rose-700"
        : "bg-muted text-muted-foreground";

// ---------- columns ----------
export const buildColumns = (): ColumnDef<MarketData>[] => {
  return [
    {
      accessorKey: "symbol",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Symbol" />,
      cell: ({ row }) => {
        const symbol = row.getValue("symbol") as string
        return (
          <div className="flex items-center gap-2 min-w-[140px]">
            <span className="font-semibold">{symbol}</span>
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const name = (row.getValue("name") as string) ?? "—"
        return <div className="text-sm text-muted-foreground truncate max-w-[220px]">{name}</div>
      },
      enableSorting: true,
    },
    {
      accessorKey: "exchange",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Exchange" />,
      cell: ({ row }) => {
        const exchange = (row.getValue("exchange") as string) ?? "—"
        return (
          <div className="min-w-[90px]">
            {exchange}
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "asset",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Asset" />,
      cell: ({ row }) => {
        const asset = (row.getValue("asset") as string) ?? "—"
        const cls = assetBadgeClasses[asset] ?? "bg-gray-100 text-gray-700"
        return (
          <Badge className={`rounded-xl px-2 py-[3px] capitalize ${cls}`} variant="outline">
            {asset}
          </Badge>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "last_price",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
      cell: ({ row }) => {
        const p = row.getValue("last_price") as number | null
        return <div className="font-medium tabular-nums">{fmtPrice(p)}</div>
      },
      enableSorting: true,
    },
    {
      accessorKey: "last_close",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Close" />,
      cell: ({ row }) => {
        const lc = row.getValue("last_close") as number | null
        return <div className="font-medium tabular-nums text-sm">{fmtPrice(lc)}</div>
      },
      enableSorting: true,
    },
    {
      accessorKey: "prev_close",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Prev Close" />,
      cell: ({ row }) => {
        const pc = row.getValue("prev_close") as number | null
        return <div className="font-medium tabular-nums text-sm">{fmtPrice(pc)}</div>
      },
      enableSorting: true,
    },

    {
      accessorKey: "change",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Change" />
      ),
      sortingFn: (a, b) =>
        Number(a.getValue("change") ?? 0) - Number(b.getValue("change") ?? 0),
      cell: ({ row }) => {
        const { change: ch, asset, exchange } = row.original as MarketData;
        const sign = ch == null ? "" : ch > 0 ? "+" : "";
        const symbol = getCurrencySymbol(asset, exchange);

        return (
          <div className={`tabular-nums font-medium ${textTone(ch)}`}>
            {ch == null
              ? "—"
              : `${ch > 0 ? "+" : ""}${symbol}${Math.abs(ch).toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}`}
          </div>

        );
      },
      enableSorting: true,
    },


    // Percent change (badge)
    {
      accessorKey: "change_pct",
      header: ({ column }) => <DataTableColumnHeader column={column} title="% Change" />,
      sortingFn: (a, b) => (Number(a.getValue("change_pct") ?? 0) - Number(b.getValue("change_pct") ?? 0)),
      cell: ({ row }) => {
        const { change_pct: pct } = row.original as MarketData;
        const sign = pct == null ? "" : (pct as number) > 0 ? "+" : "";
        return (
          <Badge className={`rounded-xl px-2 py-[3px] tabular-nums ${pctBadgeTone(pct)}`} variant="outline">
            {pct == null ? "—" : `${sign}${Number(pct).toFixed(2)}%`}
          </Badge>
        );
      },
      enableSorting: true,
    },


    {
      accessorKey: "last_updated",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Updated" />,
      cell: ({ row }) => {
        const iso = row.getValue("last_updated") as string | null
        return (
          <div className="flex items-center gap-1 text-sm whitespace-nowrap">
            <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="text-muted-foreground">{timeAgo(iso)}</span>
          </div>
        )
      },
      enableSorting: true,
    },
    {
      id: "actions",
      accessorKey: "symbol",
      header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
      cell: ({ row }) => {
        const symbol = row.getValue("symbol") as string
        return (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-8 w-10 p-0 bg-transparent" aria-label={`Open ${symbol} details`}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[980px] rounded-2xl p-0">

              <DialogHeader className="space-y-1">
                <DialogTitle className="hidden"></DialogTitle>
                <DialogDescription className="hidden"></DialogDescription>
              </DialogHeader>
              <InstrumentDetailDialog symbol={row.original.symbol} updated={row.original.last_updated || undefined} />
              <div className="my-1"></div>
            </DialogContent>
          </Dialog>
        )
      },
      enableSorting: false,
    },
  ]
}
