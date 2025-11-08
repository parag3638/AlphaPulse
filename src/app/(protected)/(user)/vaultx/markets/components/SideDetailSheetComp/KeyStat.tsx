// import type React from "react"
// import { cn } from "@/lib/utils"

// interface KeyStatProps {
//   label: string
//   value: React.ReactNode
//   hint?: string
//   emphasis?: boolean
// }

// export function KeyStat({ label, value, hint, emphasis = false }: KeyStatProps) {
//   return (
//     <div className="rounded-xl border border-border bg-card p-4">
//       <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
//       <p className={cn("mt-2 font-semibold", emphasis ? "text-2xl" : "text-lg")}>{value?.toLocaleString()}</p>
//       {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
//     </div>
//   )
// }


import { cn } from "@/lib/utils";

interface KeyStatProps {
  label: string;
  value?: number | string | null;
  hint?: string;
  emphasis?: boolean;
}

export function KeyStat({ label, value, hint, emphasis = false }: KeyStatProps) {
  const formatted =
    value == null || value === "-"
      ? "N/A"
      : typeof value === "number"
        ? value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
        : Number(value).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className={cn("mt-2 font-semibold tabular-nums", emphasis ? "text-2xl" : "text-lg")}>
        {formatted}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
