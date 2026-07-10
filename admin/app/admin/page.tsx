"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CalendarPlus, CreditCard, UserPlus, Stethoscope } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { MetricsCards } from "@/components/analytics/metrics-cards"
import { ClinicCharts } from "@/components/analytics/clinic-charts"
import { Button } from "@/components/ui/button"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { useRouter } from "next/navigation"

export default function AdminDashboardPage() {
  const { stats, loading } = useDashboardStats()
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Operational hero */}
      <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-primary text-primary-foreground">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-balance">Operational Health</CardTitle>
          <div className="text-sm opacity-90">
            {loading
              ? "Loading…"
              : `Doctors: ${stats.totalDoctors} · Patients: ${stats.totalPatients}`}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs opacity-90">Total Appointments</div>
              <div className="text-2xl font-semibold">{loading ? "—" : `${stats.totalAppointments}`}</div>
            </div>
            <div>
              <div className="text-xs opacity-90">Total Payments</div>
              <div className="text-2xl font-semibold">{loading ? "—" : `${stats.totalPayments}`}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-[var(--success)] text-[var(--success-foreground)] hover:opacity-90"
              onClick={() => router.push("/admin/patients?action=create")}
            >
              <UserPlus className="mr-2 size-4" />
              Admit Patient
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push("/admin/appointments?action=create")}
            >
              <CalendarPlus className="mr-2 size-4" />
              Schedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/40 text-primary-foreground hover:bg-white/10 bg-transparent"
              onClick={() => router.push("/admin/payments?action=create")}
            >
              <CreditCard className="mr-2 size-4" />
              Record Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <MetricsCards
        items={[
          {
            title: "Total Appointments",
            value: String(stats.totalAppointments),
            delta: "All time",
            tone: "primary",
          },
          {
            title: "Active Patients",
            value: String(stats.totalPatients),
            delta: "Registered",
            tone: "success",
          },
          { 
            title: "On-duty Doctors", 
            value: String(stats.totalDoctors), 
            delta: "Staff count", 
            tone: "muted" 
          },
          { 
            title: "Total Payments", 
            value: String(stats.totalPayments), 
            delta: "Records", 
            tone: "warning" 
          },
        ]}
      />

      {/* Charts */}
      <ClinicCharts />

      {/* Recent Activity */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              Recent Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            ) : stats.recentAppointments && stats.recentAppointments.length ? (
              <ul className="space-y-3">
                {stats.recentAppointments.map((a: any) => (
                  <li key={a.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Appointment #{a.appointNo}</span>
                      <span className="text-xs text-muted-foreground">
                        {a.date ? new Date(a.date).toLocaleString() : "—"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Patient: {a.patientName || `ID: ${a.patientId}`} · Doctor: {a.doctorName || `ID: ${a.doctorId}`} · {a.departmentName || `Dept: ${a.departmentId}`}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">No recent appointments.</div>
            )}
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="size-5" />
              System Info
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div>Total Departments: <strong>{stats.totalDepartments}</strong></div>
            <div>Total Procedures: <strong>{stats.totalProcedures}</strong></div>
            <div>Total DSAs: <strong>{stats.totalDSAs}</strong></div>
            <p className="text-xs mt-4">All data is fetched from the database in real-time. Dashboard updates automatically.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
