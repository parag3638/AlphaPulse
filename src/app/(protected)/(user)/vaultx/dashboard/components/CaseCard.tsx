"use client"

import { useMemo, useState } from "react"
import { Search, ChevronsUpDown, AlertTriangle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// ——— Types ———
type CaseStatus = "pending" | "reviewed" | "closed" | "awaiting assignment"

type CaseRow = {
  id: string
  patient: string
  ddx: string[]
  red_flags: string[]
  status: CaseStatus
  updated: string
}

// ——— Component ———
export default function ActiveCasesCard({ data }: { data: CaseRow[] }) {
  const [q, setQ] = useState("")

  // 1) Filter by patient or ddx
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return data
    return data.filter((it) =>
      [it.patient, ...it.ddx].join(" ").toLowerCase().includes(s)
    )
  }, [q, data])

  // 2) Sort by updated desc
  const sorted = useMemo(
    () =>
      [...filtered].sort(
        (a, b) => +new Date(b.updated) - +new Date(a.updated)
      ),
    [filtered]
  )

  // 3) Show top 5
  const rows = useMemo(() => sorted.slice(0, 5), [sorted])

  return (
    <Card className="rounded-lg border shadow-sm h-ful">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Updates</CardTitle>
          <span className="text-xs text-muted-foreground">
            Showing latest by update time
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search only */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patient or DDx…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 w-1/2 md:w-1/3"
            aria-label="Search cases"
          />
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>DDx</TableHead>
                  <TableHead>Red Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Updated
                    <ChevronsUpDown className="ml-1 inline-block h-4 w-4 align-text-bottom opacity-60" />
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-8 text-center">
                      <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No matching cases</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((item) => {
                    const ddxDisplay = item.ddx?.slice(0, 1) || []
                    const overflow = Math.max(0, (item.ddx?.length || 0) - 3)
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        {/* Patient */}
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                              {initials(item.patient)}
                            </div>
                            <span>{item.patient}</span>
                          </div>
                        </TableCell>

                        {/* DDx */}
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {ddxDisplay.map((dx) => (
                              <DxChip key={dx} label={dx} />
                            ))}

                            {overflow > 0 && (
                              <span
                                className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ring-inset"
                                style={{
                                  backgroundColor: "hsl(220 15% 96%)",
                                  color: "hsl(220 15% 30%)",
                                  boxShadow: "inset 0 0 0 1px hsl(220 15% 88%)",
                                }}
                                title={item.ddx.slice(3).join(", ")}
                              >
                                +{overflow}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Red Flags */}
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="text-xs cursor-help"
                                aria-label={`${item.red_flags?.length || 0} red flags`}
                              >
                                {item.red_flags?.length || 0}
                              </Badge>
                            </TooltipTrigger>
                            {item.red_flags?.length > 0 && (
                              <TooltipContent>
                                <ul className="text-xs space-y-1">
                                  {item.red_flags.map((f) => (
                                    <li key={f}>• {f}</li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <StatusPill status={normalizeStatus(item.status)} />
                        </TableCell>

                        {/* Updated */}
                        <TableCell className="text-sm text-muted-foreground">
                          {relativeTime(item.updated)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}

// ——— Utils ———
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
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

function normalizeStatus(s: string): CaseStatus {
  return s.toLowerCase() as CaseStatus
}

// ——— DxChip + color logic from your version ———
function DxChip({ label }: { label: string }) {
  const { bg, fg, br } = dxColors(label)
  const icon = dxIcon(label)
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset"
      style={{
        backgroundColor: bg,
        color: fg,
        boxShadow: `inset 0 0 0 1px ${br}`,
      }}
      title={label}
    >
      {icon && <span className="opacity-80">{icon}</span>}
      {label}
    </span>
  )
}

function dxColors(label: string) {
  const l = label.toLowerCase()
  const hue =
    l.includes("asthma") || l.includes("bronch") || l.includes("pneum")
      ? 200
      : l.includes("card") || l.includes("coron")
      ? 350
      : l.includes("neuro") || l.includes("migraine")
      ? 270
      : l.includes("thyroid") || l.includes("diabet")
      ? 40
      : l.includes("gastro") || l.includes("ulcer")
      ? 20
      : l.includes("derm") || l.includes("eczema")
      ? 140
      : l.includes("renal") || l.includes("urinar")
      ? 190
      : hashHue(label)
  const bg = `hsl(${hue} 70% 96%)`
  const fg = `hsl(${hue} 35% 28%)`
  const br = `hsl(${hue} 45% 85%)`
  return { bg, fg, br }
}

function hashHue(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h) % 360
}

function dxIcon(label: string) {
  const l = label.toLowerCase()
  if (l.includes("asthma") || l.includes("bronch") || l.includes("pneum"))
    return "🌬️"
  if (l.includes("card") || l.includes("angina") || l.includes("coron"))
    return "❤️"
  if (l.includes("neuro") || l.includes("migraine")) return "🧠"
  if (l.includes("thyroid") || l.includes("diabet")) return "🧪"
  if (l.includes("gastro") || l.includes("ulcer")) return "🍽️"
  if (l.includes("derm") || l.includes("eczema")) return "🧴"
  if (l.includes("renal") || l.includes("uti") || l.includes("urinar"))
    return "💧"
  return null
}

// ——— StatusPill + palette ———
import { CheckCircle2, Clock3, PauseCircle, XCircle } from "lucide-react"

function StatusPill({ status }: { status: CaseStatus }) {
  const s = statusStyle(status)
  const Icon = s.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset"
      style={{
        backgroundColor: s.bg,
        color: s.fg,
        boxShadow: `inset 0 0 0 1px ${s.br}`,
      }}
    >
      <Icon className="h-3.5 w-3.5 opacity-80" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function statusStyle(status: CaseStatus): {
  bg: string
  fg: string
  br: string
  icon: React.ElementType
} {
  switch (status) {
    case "pending":
      return pastel(40, Clock3)
    case "reviewed":
      return pastel(150, CheckCircle2)
    case "awaiting assignment":
      return pastel(40, PauseCircle)
    case "closed":
    default:
      return pastel(0, XCircle, 90, 30, 86)
  }
}

function pastel(
  hue: number,
  icon: React.ElementType,
  sat = 70,
  fgLight = 35,
  brLight = 85
) {
  const bg = `hsl(${hue} ${sat}% 96%)`
  const fg = `hsl(${hue} ${fgLight}% 28%)`
  const br = `hsl(${hue} 45% ${brLight}%)`
  return { bg, fg, br, icon }
}
