"use client"

import { useState } from "react"
import { MetricsCards } from "@/components/analytics/metrics-cards"
import { ClinicCharts } from "@/components/analytics/clinic-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAnalyticsData, Period } from "@/hooks/use-analytics-data"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, CalendarRange, Calendar, BarChart3 } from "lucide-react"

const PERIODS: { label: string; value: Period; icon: React.ReactNode; description: string }[] = [
  { label: "Daily", value: "daily", icon: <CalendarDays className="w-4 h-4" />, description: "Today" },
  { label: "Weekly", value: "weekly", icon: <CalendarRange className="w-4 h-4" />, description: "This Week" },
  { label: "Monthly", value: "monthly", icon: <Calendar className="w-4 h-4" />, description: "This Month" },
  { label: "Yearly", value: "yearly", icon: <BarChart3 className="w-4 h-4" />, description: "This Year" },
]

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₨ ${(amount / 100000).toFixed(2)}L`
  if (amount >= 1000) return `₨ ${(amount / 1000).toFixed(1)}K`
  return `₨ ${amount.toLocaleString()}`
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("monthly")
  const { data, loading } = useAnalyticsData(period)

  const avgAppointments =
    data.totalAppointments > 0
      ? (data.totalAppointments / (data.appointmentsTrend.filter((d) => d.count > 0).length || 1)).toFixed(1)
      : "0"

  return (
    <div className="space-y-6 min-w-0">
      {/* Header + Period Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hospital performance overview — {PERIODS.find((p) => p.value === period)?.description}
          </p>
        </div>

        {/* Period Toggle Pills */}
        <div className="flex items-center gap-1 rounded-xl border bg-muted p-1 self-start sm:self-auto">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  period === p.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }
              `}
            >
              {p.icon}
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Highlight Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary p-6 text-primary-foreground shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium opacity-80">
              Total Revenue — {PERIODS.find((p) => p.value === period)?.description}
            </p>
            {loading ? (
              <Skeleton className="h-10 w-40 mt-2 bg-primary-foreground/20" />
            ) : (
              <p className="text-4xl font-bold mt-1 tracking-tight">
                {formatCurrency(data.totalRevenue)}
              </p>
            )}
            <p className="text-xs opacity-70 mt-1">
              Expenses: {loading ? "..." : formatCurrency(data.totalExpenses)}
            </p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              {loading ? (
                <Skeleton className="h-8 w-16 bg-primary-foreground/20 mx-auto" />
              ) : (
                <p className="text-2xl font-bold">{data.totalAppointments}</p>
              )}
              <p className="text-xs opacity-70 mt-0.5">Appointments</p>
            </div>
            <div>
              {loading ? (
                <Skeleton className="h-8 w-16 bg-primary-foreground/20 mx-auto" />
              ) : (
                <p className="text-2xl font-bold">{data.appointmentsByDepartment.length}</p>
              )}
              <p className="text-xs opacity-70 mt-0.5">Depts Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <MetricsCards
        items={[
          {
            title: "Total Revenue",
            value: loading ? "..." : formatCurrency(data.totalRevenue),
            delta: PERIODS.find((p) => p.value === period)?.description ?? "",
            tone: "primary",
          },
          {
            title: "Total Expenses",
            value: loading ? "..." : formatCurrency(data.totalExpenses),
            delta: "Estimated (30%)",
            tone: "muted",
          },
          {
            title: "Appointments",
            value: loading ? "..." : String(data.totalAppointments),
            delta: `Avg: ${avgAppointments}`,
            tone: "accent",
          },
          {
            title: "Departments",
            value: loading ? "..." : String(data.appointmentsByDepartment.length),
            delta: "Active",
            tone: "warning",
          },
        ]}
      />

      {/* Charts */}
      <ClinicCharts period={period} data={data} loading={loading} />

      {/* Department-wise Breakdown */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle>Appointments by Department</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : data.appointmentsByDepartment.length > 0 ? (
              <ul className="space-y-2">
                {data.appointmentsByDepartment.map((dept, i) => (
                  <li key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">{dept.name}</span>
                    <span className="font-semibold">{dept.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">
                No department data for this period.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : data.paymentsMethods.length > 0 ? (
              <ul className="space-y-2">
                {data.paymentsMethods.map((method, i) => (
                  <li key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">{method.method}</span>
                    <span className="font-semibold">{method.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">
                No payment data for this period.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
