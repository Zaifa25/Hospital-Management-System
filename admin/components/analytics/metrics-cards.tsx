"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type MetricCard = {
  title: string
  value: string
  delta?: string
  tone?: "primary" | "accent" | "muted" | "success" | "warning"
}

const toneClass: Record<NonNullable<MetricCard["tone"]>, string> = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  muted: "bg-muted text-muted-foreground",
  success: "bg-[var(--success)] text-[var(--success-foreground)]",
  warning: "bg-[var(--warning)] text-[var(--warning-foreground)]",
}

export function MetricsCards({ items }: { items: MetricCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((m, i) => (
        <Card
          key={i}
          className={`transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${m.tone ? toneClass[m.tone] : ""}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm/5 opacity-90">{m.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-semibold">{m.value}</div>
            {m.delta ? <div className="text-xs opacity-80 mt-1">{m.delta}</div> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
