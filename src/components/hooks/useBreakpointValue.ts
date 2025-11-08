// hooks/useBreakpointValue.ts
"use client"
import { useEffect, useMemo, useState } from "react"

type Break = "base" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
type Map<T> = Partial<Record<Break, T>>

const QUERIES: Record<Exclude<Break, "base">, string> = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
  "3xl": "(min-width: 1680px)",
}

export function useBreakpointValue<T>(values: Map<T>) {
  const getValue = () => {
    if (typeof window === "undefined") return values.base
    // Evaluate from largest → smallest so the largest matching breakpoint wins
    const order: Exclude<Break, "base">[] = ["3xl", "2xl", "xl", "lg", "md", "sm"]
    for (const bp of order) {
      const q = QUERIES[bp]
      if (window.matchMedia(q).matches && bp in values) return values[bp]
    }
    return values.base
  }

  const [val, setVal] = useState<T | undefined>(() => getValue())

  useEffect(() => {
    if (typeof window === "undefined") return
    const mqs = Object.entries(QUERIES).map(([bp, q]) => ({
      bp,
      mq: window.matchMedia(q),
    }))

    const onChange = () => setVal(getValue())
    mqs.forEach(({ mq }) => mq.addEventListener?.("change", onChange))
    // Initial sync (in case of hydration mismatch)
    onChange()

    return () => {
      mqs.forEach(({ mq }) => mq.removeEventListener?.("change", onChange))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]) // re-evaluate if the map changes

  return val
}
