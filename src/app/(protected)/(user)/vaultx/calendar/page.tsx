"use client"

import { FiltersBar } from "./components/filters-bar"
import { EventList } from "./components/event-list"
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import type { Event } from "@/lib/types";

// const BASE_URL = process.env.NEXT_PUBLIC_APIBASE || "http://localhost:9000";
const BASE_URL = process.env.NEXT_PUBLIC_APIBASE || "https://authbackend-cc2d.onrender.com";

const startOfDay = (date: Date) => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

const endOfDay = (date: Date) => {
  const normalized = new Date(date)
  normalized.setHours(23, 59, 59, 999)
  return normalized
}

const decodeCursor = (cursor: string | null) => {
  if (!cursor) return null
  try {
    return decodeURIComponent(cursor)
  } catch {
    return cursor
  }
}

export default function CalendarPage() {
  const [filters, setFilters] = useState({
    from: startOfDay(new Date()),
    to: endOfDay(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    markets: [] as string[],
    impacts: [] as string[],
    types: [] as string[],
    search: "",
    symbols: [] as string[],
  })

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [pendingInitialLoad, setPendingInitialLoad] = useState(true)
  const cursorRef = useRef<string | null>(null)
  const filterVersionRef = useRef(0)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)
    const requestVersion = filterVersionRef.current

    try {
      const searchParams = new URLSearchParams()

      if (filters.from) searchParams.append("from", filters.from.toISOString())
      if (filters.to) searchParams.append("to", filters.to.toISOString())
      if (filters.markets?.length) filters.markets.forEach((m: string) => searchParams.append("market", m))
      if (filters.impacts?.length) filters.impacts.forEach((i: string) => searchParams.append("impact", i))
      if (filters.types?.length) filters.types.forEach((t: string) => searchParams.append("type", t))
      if (filters.search) searchParams.append("q", filters.search)
      if (filters.symbols?.length) filters.symbols.forEach((s: string) => searchParams.append("symbols[]", s))
      searchParams.append("limit", "20")
      if (cursorRef.current) searchParams.append("cursor", cursorRef.current)

      const response = await axios.get(`${BASE_URL}/calendar/events?${searchParams}`, {
        withCredentials: true,
        // headers: { "Cache-Control": "no-store" },
      })
      const data = response.data

      if (requestVersion !== filterVersionRef.current) {
        return
      }

      setEvents((prev) => [...prev, ...data.items])
      cursorRef.current = decodeCursor(data.next ?? null)
      setHasMore(!!cursorRef.current)
    } catch (err) {
      if (requestVersion === filterVersionRef.current) {
        const message = axios.isAxiosError(err) ? err.message : "Unknown error"
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }, [filters, loading, hasMore])

  useEffect(() => {
    filterVersionRef.current += 1
    setEvents([])
    cursorRef.current = null
    setHasMore(true)
    setError(null)
    setPendingInitialLoad(true)
  }, [filters])

  useEffect(() => {
    if (!pendingInitialLoad || loading) {
      return
    }

    let cancelled = false

    const runInitialLoad = async () => {
      try {
        await loadMore()
      } finally {
        if (!cancelled) {
          setPendingInitialLoad(false)
        }
      }
    }

    runInitialLoad()

    return () => {
      cancelled = true
    }
  }, [pendingInitialLoad, loading, loadMore])

  const handleApplyFilters = useCallback((newFilters: typeof filters) => {
    setFilters({
      ...newFilters,
      from: startOfDay(newFilters.from),
      to: endOfDay(newFilters.to),
    })
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card px-8 pb-4">
        <h1 className="text-3xl font-bold text-balance">Upcoming Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">Macro • Earnings • Crypto</p>
      </div>

      {/* Filters */}
      <FiltersBar filters={filters} onApply={handleApplyFilters} />

      {/* Content */}
      <div className="px-8 py-8">
        <EventList
          events={events}
          loading={loading}
          pendingInitialLoad={pendingInitialLoad}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </main>
  )
}
