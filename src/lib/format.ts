export function fmtNumber(n?: number | null): string {
  if (n === null || n === undefined) return "—"

  if (Math.abs(n) >= 1000000) {
    return (n / 1000000).toFixed(2) + "M"
  }
  if (Math.abs(n) >= 1000) {
    return (n / 1000).toFixed(2) + "K"
  }

  const absVal = Math.abs(n)
  if (absVal >= 100) return n.toFixed(0)
  if (absVal >= 1) return n.toFixed(2)
  return n.toFixed(4)
}

export function fmtPrice(n?: number | null): string {
  if (n === null || n === undefined) return "—"

  const absVal = Math.abs(n)
  if (absVal >= 100) return n.toFixed(2)
  if (absVal >= 1) return n.toFixed(4)
  return n.toFixed(6)
}

export function fmtPct(n?: number | null): string {
  if (n === null || n === undefined) return "—"

  const sign = n >= 0 ? "+" : ""
  return `${sign}${n.toFixed(2)}%`
}

export function timeAgo(ts?: string | null): string {
  if (!ts) return "—"

  const date = new Date(ts)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`

  return `${Math.floor(seconds / 86400)}d ago`
}
