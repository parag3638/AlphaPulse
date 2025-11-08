"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SparklineProps {
  data: Array<{ ts: string; close: number }>
}

export function Sparkline({ data }: SparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-border bg-muted/20">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    )
  }

  return (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="ts" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value) => value.toFixed(2)}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
