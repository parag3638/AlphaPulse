import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fmtPrice, fmtNumber } from "@/lib/format"
// import type { PriceBar1m } from "@/types/prices"

interface BarTableProps {
    rows: PriceBar1m[]
}

export type PriceBar1m = {
    ts: string
    open: number
    high: number
    low: number
    close: number
    volume: number | null
}


export function BarTable({ rows }: BarTableProps) {
    return (
        <ScrollArea className="h-36">
            <Table className="text-sm">
                <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                        <TableHead className="text-right w-20">Time</TableHead>
                        <TableHead className="text-right w-20">Open</TableHead>
                        <TableHead className="text-right w-20">High</TableHead>
                        <TableHead className="text-right w-20">Low</TableHead>
                        <TableHead className="text-right w-20">Close</TableHead>
                        <TableHead className="text-right w-24">Volume</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/50">
                            <TableCell className="text-right font-mono text-xs">
                                {new Date(row.ts).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </TableCell>
                            <TableCell className="text-right font-mono">{fmtPrice(row.open)}</TableCell>
                            <TableCell className="text-right font-mono">{fmtPrice(row.high)}</TableCell>
                            <TableCell className="text-right font-mono">{fmtPrice(row.low)}</TableCell>
                            <TableCell className="text-right font-mono">{fmtPrice(row.close)}</TableCell>
                            <TableCell className="text-right font-mono">{fmtNumber(row.volume)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    )
}
