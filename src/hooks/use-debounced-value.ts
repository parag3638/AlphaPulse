// hooks/use-debounced-value.ts
"use client"

import { useEffect, useState } from "react"

/**
 * Debounces a changing value and returns the debounced value after `delay` ms.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
