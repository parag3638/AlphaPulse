import { Badge } from "@/components/ui/badge"

interface TagsProps {
  exchange: string | null
  asset: string | null
}

export function Tags({ exchange, asset }: TagsProps) {
  return (
    <div className="flex gap-1 -ml-1">
      {exchange && (
        <Badge variant="secondary" className="rounded-full bg-emerald-100 text-emerald-700">
          {exchange}
        </Badge>
      )}
      <Badge variant="secondary" className="rounded-full capitalize bg-sky-100 text-sky-700">
        {asset ?? "—"}
      </Badge>
    </div>
  )
}
