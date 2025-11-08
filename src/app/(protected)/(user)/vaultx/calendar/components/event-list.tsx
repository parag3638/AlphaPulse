"use client"

import { useEffect, useRef } from "react"
import { EventCard } from "./event-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Event } from "@/lib/types"
import type { FC } from "react"

interface EventListProps {
  events: Event[]
  loading: boolean
  pendingInitialLoad: boolean
  error: string | null
  hasMore: boolean
  onLoadMore: () => void
}

export const EventList: FC<EventListProps> = ({
  events,
  loading,
  pendingInitialLoad,
  error,
  hasMore,
  onLoadMore,
}) => {
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          onLoadMore()
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, onLoadMore])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const shouldShowEmptyState = events.length === 0 && !loading && !pendingInitialLoad

  if (shouldShowEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-4">📅</div>
        <h3 className="text-lg font-semibold">No events found</h3>
        <p className="text-muted-foreground">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event, idx) => (
          <EventCard key={`${event.id}-${event.datetime_utc}-${idx}`} event={event} />
        ))}

        {/* Skeleton loading */}
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="space-y-4 rounded-2xl border border-border p-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="mt-8 flex justify-center">
        {hasMore && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
      </div>
    </>
  )
}
