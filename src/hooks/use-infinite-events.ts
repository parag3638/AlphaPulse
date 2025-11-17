"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import axios from "axios"
import type { Event } from "@/lib/types"

const BASE_URL = process.env.NEXT_PUBLIC_APIBASE || "https://api.alphapulse.local"

export function useInfiniteEvents(filters: any) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const cursorRef = useRef<string | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

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
        headers: {
          "Cache-Control": "no-store",
        },
      })
      const data = response.data

      setEvents((prev) => [...prev, ...data.items])
      cursorRef.current = data.next
      setHasMore(!!data.next)
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.message : "Unknown error"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [filters, loading, hasMore])

  useEffect(() => {
    setEvents([])
    cursorRef.current = null
    setHasMore(true)
    setError(null)
  }, [filters])

  useEffect(() => {
    loadMore()
  }, []) // Only run once on mount for initial load

  const refetch = useCallback(() => {
    setEvents([])
    cursorRef.current = null
    setHasMore(true)
    setLoading(true)
  }, [])

  return { events, loading, error, hasMore, loadMore, refetch }
}
