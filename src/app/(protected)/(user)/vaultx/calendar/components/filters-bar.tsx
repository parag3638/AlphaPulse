"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { CalendarIcon, ChevronDown } from "lucide-react"
import type { FC } from "react"
import { cn } from "@/lib/utils"

const normalizeDate = (date: Date, boundary: "start" | "end") => {
  const normalized = new Date(date)
  if (boundary === "start") {
    normalized.setHours(0, 0, 0, 0)
  } else {
    normalized.setHours(23, 59, 59, 999)
  }
  return normalized
}

interface FilterBarProps {
  filters: {
    from: Date
    to: Date
    markets: string[]
    impacts: string[]
    types: string[]
    search: string
    symbols: string[]
  }
  onApply: (filters: any) => void
}

export const FiltersBar: FC<FilterBarProps> = ({ filters, onApply }) => {
  const [local, setLocal] = useState(filters)
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = useCallback((key: string, value: any) => {
    const nextValue =
      value instanceof Date && (key === "from" || key === "to")
        ? normalizeDate(value, key === "from" ? "start" : "end")
        : value
    setLocal((prev) => ({ ...prev, [key]: nextValue }))
    setHasChanges(true)
  }, [])

  const handleApply = () => {
    onApply(local)
    setHasChanges(false)
  }

  const handleClear = () => {
    const defaultFilters = {
      from: normalizeDate(new Date(), "start"),
      to: normalizeDate(new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), "end"),
      markets: [],
      impacts: [],
      types: [],
      search: "",
      symbols: [],
    }
    setLocal(defaultFilters)
    onApply(defaultFilters)
    setHasChanges(false)
  }

  const typeOptions = [
    { label: "Macro", value: "macro" },
    { label: "Earnings", value: "earnings" },
    { label: "Crypto", value: "crypto" },
    { label: "Other", value: "other" },
  ]

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-card px-8 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">From:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("w-[140px] justify-start text-left font-normal", !local.from && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(local.from, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={local.from} onSelect={(date) => date && handleChange("from", date)} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">To:</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn("w-[140px] justify-start text-left font-normal", !local.to && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(local.to, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={local.to} onSelect={(date) => date && handleChange("to", date)} />
            </PopoverContent>
          </Popover>
        </div>

        <Input
          placeholder="Search events..."
          value={local.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className="w-40"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              {local.types.length > 0 ? local.types[0].charAt(0).toUpperCase() + local.types[0].slice(1) : "All Types"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              checked={local.types.length === 0}
              onCheckedChange={() => handleChange("types", [])}
            >
              All Types
            </DropdownMenuCheckboxItem>
            {typeOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={local.types.includes(option.value)}
                onCheckedChange={(checked) => handleChange("types", checked ? [option.value] : [])}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <Button size="sm" onClick={handleApply} className={hasChanges ? "relative" : ""}>
            Apply {hasChanges && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
