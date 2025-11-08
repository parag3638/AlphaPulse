// components/date-picker-field.tsx
"use client";

import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export type DatePickerFieldProps = {
  id: string;
  /** ISO date string "yyyy-MM-dd" (empty string allowed) */
  value: string;
  onChange: (nextIso: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;

  /** Optional bounds (also used to infer year dropdown range) */
  min?: string; // e.g. "1900-01-01"
  max?: string; // e.g. "2025-10-05"

  /** Explicit year range (overrides deriving from min/max) */
  fromYear?: number;
  toYear?: number;

  /** Default month to show when no value (e.g. DOB start) */
  defaultMonth?: Date;
};

export function DatePickerField({
  id,
  value,
  onChange,
  required,
  disabled,
  placeholder = "Pick a date",
  className,
  min,
  max,
  fromYear,
  toYear,
  defaultMonth,
}: DatePickerFieldProps) {
  const selectedDate = value ? parseISO(value) : undefined;
  const display = selectedDate && isValid(selectedDate) ? format(selectedDate, "PPP") : "";

  // Derive dropdown year range if not provided
  const derivedFromYear =
    fromYear ??
    (min ? parseISO(min).getFullYear() : 1900);

  const derivedToYear =
    toYear ??
    (max ? parseISO(max).getFullYear() : new Date().getFullYear());

  const handleSelect = (d?: Date) => {
    const iso = d ? format(d, "yyyy-MM-dd") : "";
    onChange(iso);
  };

  // Constrain by day range if min/max provided
  const fromDate = min ? parseISO(min) : undefined;
  const toDate = max ? parseISO(max) : undefined;

  return (
    <div className={cn("w-full", className)}>
      <div className="relative">
        <Popover>
          <PopoverTrigger asChild>
            <Input
              id={id}
              type="text"
              value={display}
              placeholder={placeholder}
              readOnly
              disabled={disabled}
              aria-haspopup="dialog"
              className="pr-10 cursor-pointer"
            />
          </PopoverTrigger>

          {/* icon adornment */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <CalendarIcon className={cn("h-4 w-4 opacity-60", disabled && "opacity-40")} />
          </div>

          <PopoverContent
            className="w-auto p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              // 👇 enable month/year dropdowns
              captionLayout="dropdown"
              fromYear={derivedFromYear}
              toYear={derivedToYear}
              // 👇 optional day constraints (e.g., DOB should not be future)
              fromDate={fromDate}
              toDate={toDate}
              // If no value, which month to show first
              defaultMonth={selectedDate ?? defaultMonth}
              initialFocus
              className="rounded-md border shadow-sm"
            />
          </PopoverContent>
        </Popover>

        {/* Hidden native input keeps HTML5 validation & form submission */}
        <input
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          id={`${id}__native`}
          name={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          className="sr-only"
        />
      </div>
    </div>
  );
}
