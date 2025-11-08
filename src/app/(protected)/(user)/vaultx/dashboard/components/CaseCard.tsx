// "use client"

// import { useMemo, useState } from "react"
// import { Search, ChevronsUpDown, AlertTriangle } from "lucide-react"
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { Skeleton } from "@/components/ui/skeleton"

// // ——— Types ———
// type CaseStatus = "Pending" | "Reviewed" | "Closed" | "Awaiting Assignment"
// type CaseRow = {
//     id: string
//     patient: string
//     ddx: string[]
//     redFlags: string[]
//     status: CaseStatus
//     updatedAt: string // ISO
// }

// // ——— Mock Data (trim/extend as you wish) ———
// const MOCK: CaseRow[] = [
//     { id: "case-001", patient: "Sarah Johnson", ddx: ["Pneumonia", "Bronchitis", "Asthma"], redFlags: ["Fever", "Shortness of breath"], status: "Pending", updatedAt: isoHoursAgo(2) },
//     { id: "case-002", patient: "Michael Chen", ddx: ["Migraine", "Tension headache"], redFlags: ["Vision changes"], status: "Reviewed", updatedAt: isoHoursAgo(5) },
//     { id: "case-003", patient: "Emma Davis", ddx: ["Gastroenteritis"], redFlags: [], status: "Pending", updatedAt: isoHoursAgo(1) },
//     { id: "case-004", patient: "James Wilson", ddx: ["Hypertension", "Anxiety"], redFlags: ["Chest pain", "Elevated BP", "Palpitations"], status: "Awaiting Assignment", updatedAt: isoHoursAgo(12) },
//     { id: "case-005", patient: "Lisa Anderson", ddx: ["Urinary tract infection"], redFlags: ["Dysuria"], status: "Reviewed", updatedAt: isoHoursAgo(3) },
//     { id: "case-006", patient: "Robert Martinez", ddx: ["Type 2 Diabetes", "Metabolic syndrome"], redFlags: ["Elevated glucose", "Weight gain"], status: "Closed", updatedAt: isoDaysAgo(2) },
//     { id: "case-007", patient: "Jennifer Lee", ddx: ["Allergic rhinitis", "Sinusitis"], redFlags: [], status: "Pending", updatedAt: isoMinutesAgo(30) },
//     { id: "case-008", patient: "David Brown", ddx: ["Dermatitis", "Eczema"], redFlags: ["Severe itching"], status: "Reviewed", updatedAt: isoHoursAgo(8) },
//     { id: "case-009", patient: "Patricia Garcia", ddx: ["Osteoarthritis"], redFlags: ["Joint pain", "Limited mobility"], status: "Pending", updatedAt: isoHoursAgo(4) },
//     { id: "case-010", patient: "Christopher Taylor", ddx: ["Insomnia", "Sleep apnea"], redFlags: ["Daytime fatigue"], status: "Awaiting Assignment", updatedAt: isoHoursAgo(18) },
//     { id: "case-011", patient: "Nancy White", ddx: ["Hypothyroidism"], redFlags: ["Fatigue", "Weight gain"], status: "Reviewed", updatedAt: isoHoursAgo(6) },
//     { id: "case-012", patient: "Daniel Harris", ddx: ["Anxiety disorder"], redFlags: ["Panic attacks"], status: "Pending", updatedAt: isoMinutesAgo(45) },
//     { id: "case-013", patient: "Karen Martin", ddx: ["Hypertension"], redFlags: ["Elevated BP"], status: "Closed", updatedAt: isoDaysAgo(5) },
//     { id: "case-014", patient: "Paul Thompson", ddx: ["Acute bronchitis", "Cough"], redFlags: ["Fever", "Productive cough"], status: "Pending", updatedAt: isoMinutesAgo(90) },
//     { id: "case-015", patient: "Susan Jackson", ddx: ["Anemia"], redFlags: ["Fatigue", "Pallor"], status: "Reviewed", updatedAt: isoHoursAgo(7) },
//     { id: "case-016", patient: "Mark Robinson", ddx: ["Gastric ulcer", "GERD"], redFlags: ["Abdominal pain", "Heartburn"], status: "Awaiting Assignment", updatedAt: isoHoursAgo(20) },
//     { id: "case-017", patient: "Linda Clark", ddx: ["Thyroiditis"], redFlags: ["Neck pain"], status: "Pending", updatedAt: isoMinutesAgo(15) },
//     { id: "case-018", patient: "Steven Rodriguez", ddx: ["Hypertension", "Coronary artery disease"], redFlags: ["Chest pain", "Elevated BP", "Dyspnea"], status: "Reviewed", updatedAt: isoHoursAgo(10) },
// ]

// // ——— Component ———
// export default function ActiveCasesCard() {
//     const [q, setQ] = useState("")

//     // 1) filter by patient or ddx (case-insensitive)
//     const filtered = useMemo(() => {
//         const s = q.trim().toLowerCase()
//         if (!s) return MOCK
//         return MOCK.filter((it) => [it.patient, ...it.ddx].join(" ").toLowerCase().includes(s))
//     }, [q])

//     // 2) sort by updatedAt desc
//     const sorted = useMemo(
//         () => [...filtered].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
//         [filtered],
//     )

//     // 3) take top 8
//     const rows = useMemo(() => sorted.slice(0, 5), [sorted])

//     return (
//         <Card className="rounded-lg border shadow-sm">
//             <CardHeader className="pb-4">
//                 <div className="flex items-center justify-between">
//                     <CardTitle>Recent Updates</CardTitle>
//                     {/* Hint text only; no date filter */}
//                     <span className="text-xs text-muted-foreground">Showing latest by update time</span>
//                 </div>
//             </CardHeader>

//             <CardContent className="space-y-4">
//                 {/* Search only */}
//                 <div className="relative">
//                     <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                     <Input
//                         placeholder="Search patient or DDx…"
//                         value={q}
//                         onChange={(e) => setQ(e.target.value)}
//                         className="pl-9 w-1/2 md:w-1/3"
//                         aria-label="Search cases"
//                     />
//                 </div>

//                 {/* Table */}
//                 <div className="border rounded-lg overflow-hidden">
//                     <TooltipProvider>
//                         <Table>
//                             <TableHeader>
//                                 <TableRow>
//                                     <TableHead>Patient</TableHead>
//                                     <TableHead>DDx</TableHead>
//                                     <TableHead>Red Flags</TableHead>
//                                     <TableHead>Status</TableHead>
//                                     <TableHead className="whitespace-nowrap">
//                                         Updated
//                                         <ChevronsUpDown className="ml-1 inline-block h-4 w-4 align-text-bottom opacity-60" />
//                                     </TableHead>
//                                 </TableRow>
//                             </TableHeader>

//                             <TableBody>
//                                 {rows.length === 0 ? (
//                                     <TableRow>
//                                         <TableCell colSpan={5} className="p-8 text-center">
//                                             <AlertTriangle className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
//                                             <p className="text-muted-foreground">No matching cases</p>
//                                         </TableCell>
//                                     </TableRow>
//                                 ) : (
//                                     rows.map((item) => {
//                                         const ddxDisplay = item.ddx.slice(0, 3)
//                                         const overflow = Math.max(0, item.ddx.length - 3)
//                                         const styles = statusColors(item.status)
//                                         return (
//                                             <TableRow key={item.id} className="hover:bg-muted/50">
//                                                 <TableCell className="font-medium">
//                                                     <div className="flex items-center gap-2">
//                                                         <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
//                                                             {initials(item.patient)}
//                                                         </div>
//                                                         <span>{item.patient}</span>
//                                                     </div>
//                                                 </TableCell>

//                                                 <TableCell>
//                                                     <div className="flex flex-wrap gap-1.5">
//                                                         {ddxDisplay.map((dx) => (
//                                                             <DxChip key={dx} label={dx} />
//                                                         ))}

//                                                         {overflow > 0 && (
//                                                             <span
//                                                                 className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ring-1 ring-inset"
//                                                                 style={{
//                                                                     backgroundColor: "hsl(220 15% 96%)",
//                                                                     color: "hsl(220 15% 30%)",
//                                                                     boxShadow: "inset 0 0 0 1px hsl(220 15% 88%)",
//                                                                 }}
//                                                                 title={item.ddx.slice(3).join(", ")}
//                                                             >
//                                                                 +{overflow}
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </TableCell>


//                                                 <TableCell>
//                                                     <Tooltip>
//                                                         <TooltipTrigger asChild>
//                                                             <Badge variant="outline" className="text-xs cursor-help" aria-label={`${item.redFlags.length} red flags`}>
//                                                                 {item.redFlags.length}
//                                                             </Badge>
//                                                         </TooltipTrigger>
//                                                         {item.redFlags.length > 0 && (
//                                                             <TooltipContent>
//                                                                 <ul className="text-xs space-y-1">
//                                                                     {item.redFlags.map((f) => (
//                                                                         <li key={f}>• {f}</li>
//                                                                     ))}
//                                                                 </ul>
//                                                             </TooltipContent>
//                                                         )}
//                                                     </Tooltip>
//                                                 </TableCell>

//                                                 <TableCell>
//                                                     <StatusPill status={item.status} />
//                                                 </TableCell>


//                                                 <TableCell className="text-sm text-muted-foreground">
//                                                     {relativeTime(item.updatedAt)}
//                                                 </TableCell>
//                                             </TableRow>
//                                         )
//                                     })
//                                 )}
//                             </TableBody>
//                         </Table>
//                     </TooltipProvider>
//                 </div>
//             </CardContent>
//         </Card>
//     )
// }

// // ——— Utils ———
// function initials(name: string) {
//     return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
// }

// function relativeTime(iso: string) {
//     const d = new Date(iso)
//     const s = Math.floor((Date.now() - d.getTime()) / 1000)
//     const m = Math.floor(s / 60)
//     const h = Math.floor(m / 60)
//     const day = Math.floor(h / 24)
//     if (s < 60) return `${s}s ago`
//     if (m < 60) return `${m}m ago`
//     if (h < 24) return `${h}h ago`
//     return `${day}d ago`
// }

// function statusColors(status: CaseStatus): { bg: string; fg: string } {
//     switch (status) {
//         case "Pending":
//             return { bg: "color-mix(in oklab, var(--color-chart-2) 18%, transparent)", fg: "var(--color-foreground)" }
//         case "Reviewed":
//             return { bg: "color-mix(in oklab, var(--color-chart-4) 18%, transparent)", fg: "var(--color-foreground)" }
//         case "Awaiting Assignment":
//             return { bg: "color-mix(in oklab, var(--color-chart-5) 18%, transparent)", fg: "var(--color-foreground)" }
//         case "Closed":
//         default:
//             return { bg: "color-mix(in oklab, var(--color-muted-foreground) 18%, transparent)", fg: "var(--color-foreground)" }
//     }
// }

// function isoMinutesAgo(min: number) {
//     return new Date(Date.now() - min * 60 * 1000).toISOString()
// }
// function isoHoursAgo(hr: number) {
//     return new Date(Date.now() - hr * 60 * 60 * 1000).toISOString()
// }
// function isoDaysAgo(d: number) {
//     return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString()
// }


// function DxChip({ label }: { label: string }) {
//     const { bg, fg, br } = dxColors(label)
//     const icon = dxIcon(label)
//     return (
//         <span
//             className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset"
//             style={{ backgroundColor: bg, color: fg, boxShadow: `inset 0 0 0 1px ${br}` }}
//             title={label}
//         >
//             {icon && <span className="opacity-80">{icon}</span>}
//             {label}
//         </span>
//     )
// }

// // Deterministic pastel color per label (keyword palettes first, then hash hue)
// function dxColors(label: string) {
//     const l = label.toLowerCase()

//     // keyword → fixed hue (keeps same body-system color across terms)
//     const hue =
//         l.includes("asthma") || l.includes("bronch") || l.includes("pneum") ? 200 :      // respiratory (cyan)
//             l.includes("card") || l.includes("angina") || l.includes("coron") ? 350 :        // cardio (pink)
//                 l.includes("neuro") || l.includes("migraine") || l.includes("seiz") ? 270 :      // neuro (violet)
//                     l.includes("endo") || l.includes("thyroid") || l.includes("diabet") ? 40 :      // endocrine (amber)
//                         l.includes("gi") || l.includes("gastro") || l.includes("ulcer") || l.includes("gerd") ? 20 : // GI (orange)
//                             l.includes("derm") || l.includes("eczema") || l.includes("psoria") ? 140 :       // derm (green)
//                                 l.includes("renal") || l.includes("uti") || l.includes("urinar") ? 190 :          // renal/uro (teal)
//                                     hashHue(label) // fallback: stable per-string hue

//     // Pastel shades that work in light & dark
//     const bg = `hsl(${hue} 70% 96%)`
//     const fg = `hsl(${hue} 35% 28%)`
//     const br = `hsl(${hue} 45% 85%)`
//     return { bg, fg, br }
// }

// // Tiny hash → hue 0–359 (stable across sessions)
// function hashHue(s: string) {
//     let h = 0
//     for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
//     return Math.abs(h) % 360
// }

// // Optional emoji icon per body system/keyword
// function dxIcon(label: string) {
//     const l = label.toLowerCase()
//     if (l.includes("asthma") || l.includes("bronch") || l.includes("pneum")) return "🌬️"
//     if (l.includes("card") || l.includes("angina") || l.includes("coron")) return "❤️"
//     if (l.includes("neuro") || l.includes("migraine") || l.includes("seiz")) return "🧠"
//     if (l.includes("thyroid") || l.includes("diabet") || l.includes("endo")) return "🧪"
//     if (l.includes("gastro") || l.includes("ulcer") || l.includes("gerd")) return "🍽️"
//     if (l.includes("derm") || l.includes("eczema") || l.includes("psoria")) return "🧴"
//     if (l.includes("renal") || l.includes("uti") || l.includes("urinar")) return "💧"
//     return null
// }


// import { CheckCircle2, Clock3, PauseCircle, XCircle } from "lucide-react"

// function StatusPill({ status }: { status: CaseStatus }) {
//     const s = statusStyle(status)
//     const Icon = s.icon
//     return (
//         <span
//             className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset"
//             style={{
//                 backgroundColor: s.bg,
//                 color: s.fg,
//                 boxShadow: `inset 0 0 0 1px ${s.br}`,
//             }}
//             aria-label={`Status: ${status}`}
//             title={status}
//         >
//             <Icon className="h-3.5 w-3.5 opacity-80" />
//             {status}
//         </span>
//     )
// }

// function statusStyle(status: CaseStatus): {
//     bg: string; fg: string; br: string; icon: React.ElementType
// } {
//     switch (status) {
//         case "Pending":
//             return pastel(40, Clock3)                  // blue-ish
//         case "Reviewed":
//             return pastel(150, CheckCircle2)            // green-ish
//         case "Awaiting Assignment":
//             return pastel(40, PauseCircle)              // amber-ish
//         case "Closed":
//         default:
//             return pastel(0, XCircle, 90, 30, 86)       // soft gray/red
//     }
// }

// /** Pastel palette that works in light & dark.
//  *  hue (0–360), and optional sat/fgLight/brLight overrides
//  */
// function pastel(
//     hue: number,
//     icon: React.ElementType,
//     sat = 70,        // bg saturation
//     fgLight = 35,    // fg saturation
//     brLight = 85     // border lightness
// ) {
//     const bg = `hsl(${hue} ${sat}% 96%)`
//     const fg = `hsl(${hue} ${fgLight}% 28%)`
//     const br = `hsl(${hue} 45% ${brLight}%)`
//     return { bg, fg, br, icon }
// }


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
