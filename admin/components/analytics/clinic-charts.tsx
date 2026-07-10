"use client"

import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import type { AnalyticsData, Period } from "@/hooks/use-analytics-data"
import { useAnalyticsData } from "@/hooks/use-analytics-data"

interface ClinicChartsProps {
  period?: Period
  data?: AnalyticsData
  loading?: boolean
}

const periodLabels: Record<Period, string> = {
  daily: "by Hour (Today)",
  weekly: "by Day (This Week)",
  monthly: "by Day (This Month)",
  yearly: "by Month (This Year)",
}

export function ClinicCharts({ period: propPeriod, data: propData, loading: propLoading }: ClinicChartsProps) {
  // Self-contained mode: fetch own data when no props provided
  const selfHook = useAnalyticsData(propPeriod ?? "monthly")
  const period: Period = propPeriod ?? "monthly"
  const data: AnalyticsData = propData ?? selfHook.data
  const loading: boolean = propLoading ?? selfHook.loading

  if (loading) {
    return (
      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent className="h-[260px] sm:h-[300px]">
            <Skeleton className="w-full h-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="h-[260px] sm:h-[300px]">
            <Skeleton className="w-full h-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // For daily view with many ticks, reduce tick density
  const tickInterval =
    period === "daily" ? 3 : period === "monthly" && data.paymentsTrend.length > 15 ? 4 : "preserveStartEnd"

  // Map appointmentsTrend to use `label` key (backwards compat)
  const apptData = data.appointmentsTrend.map((d: any) => ({
    label: d.label ?? d.day,
    count: d.count,
  }))
  const paymentsData = data.paymentsTrend.map((d: any) => ({
    label: d.label ?? d.month,
    revenue: d.revenue,
    expenses: d.expenses,
  }))

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 min-w-0 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
        <CardHeader>
          <CardTitle>Appointments {periodLabels[period]}</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] sm:h-[300px]">
          <ChartContainer
            config={{
              count: { label: "Appointments", color: "var(--chart-1)" },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={apptData} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickMargin={8} interval={tickInterval as any} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="min-w-0 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
        <CardHeader>
          <CardTitle>Revenue vs Expenses {periodLabels[period]}</CardTitle>
        </CardHeader>
        <CardContent className="h-[260px] sm:h-[300px]">
          <ChartContainer
            config={{
              revenue: { label: "Revenue (₨)", color: "var(--chart-3)" },
              expenses: { label: "Expenses (₨)", color: "var(--chart-4)" },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentsData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickMargin={8} interval={tickInterval as any} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
