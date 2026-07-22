"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Stethoscope,
  Calendar,
  Clock,
  User,
  Hash,
  Building2,
  CheckCircle,
  XCircle,
  CheckCheck,
} from "lucide-react"

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const statusConfig: Record<string, { label: string; classes: string; dot: string }> = {
  scheduled: { label: "Scheduled", classes: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  confirmed: { label: "Confirmed", classes: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  completed: { label: "Completed", classes: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  cancelled: { label: "Cancelled", classes: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-400 opacity-50" },
}

export default function DoctorSchedulePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [doctor, setDoctor] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState<string>("all")

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("hms_jwt")
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        const base = "http://localhost:5000/api"

        const [doctorRes, apptRes] = await Promise.all([
          axios.get(`${base}/doctors/${id}`, { headers }),
          axios.get(`${base}/appointments`, { headers }),
        ])

        setDoctor(doctorRes.data)

        const normalize = (d: any): any[] => (Array.isArray(d) ? d : d?.data || d?.items || [])
        const allAppts = normalize(apptRes.data)

        const doctorAppts = allAppts
          .filter((a: any) => String(a.doctorId) === String(id))
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setAppointments(doctorAppts)
      } catch (err) {
        console.error("Failed to load doctor schedule:", err)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  // Group appointments by day-of-week
  const byDay = DAYS.reduce<Record<string, any[]>>((acc, day) => {
    acc[day] = appointments.filter(
      (a) => a.day?.toLowerCase() === day.toLowerCase()
    )
    return acc
  }, {})

  // Today's day name
  const todayName = DAYS[new Date().getDay()]

  const displayedAppts =
    activeDay === "all"
      ? appointments
      : appointments.filter((a) => a.day?.toLowerCase() === activeDay.toLowerCase())

  const totalCompleted = appointments.filter((a) => a.status === "completed").length
  const totalCancelled = appointments.filter((a) => a.status === "cancelled").length
  const totalActive = appointments.filter(
    (a) => a.status === "scheduled" || a.status === "confirmed"
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 border-b pb-6">
        <div className="flex items-start md:items-center gap-3 w-full">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 shrink-0 self-start md:self-auto mt-2 md:mt-0">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
            {loading ? (
              <Skeleton className="h-20 w-20 rounded-full shrink-0" />
            ) : (
              <Avatar className="h-20 w-20 border-2 border-primary/10 shrink-0">
                <AvatarImage src={doctor?.profilePicture ? `http://localhost:5000${doctor.profilePicture}` : undefined} alt={doctor?.name} className="object-cover" />
                <AvatarFallback className="text-xl bg-primary/5 text-primary">
                  {doctor?.name?.substring(0, 2).toUpperCase() || <Stethoscope className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className="flex-1 space-y-1">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                {loading ? <Skeleton className="h-7 w-40" /> : (doctor?.name ?? "Doctor Profile")}
              </h1>
              <p className="text-sm text-muted-foreground flex flex-wrap gap-1">
                {loading ? <Skeleton className="h-4 w-48 mt-1" /> : (
                  <>
                    <span className="font-medium text-foreground">{doctor?.department?.name || "No Department"}</span>
                    {doctor?.qualification && <span>&bull; {doctor.qualification}</span>}
                    {doctor?.experience && <span>&bull; {doctor.experience} Experience</span>}
                    {doctor?.email && <span>&bull; {doctor.email}</span>}
                  </>
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {loading ? <Skeleton className="h-5 w-20" /> : (
                  <Badge variant={doctor?.status === "active" ? "default" : "secondary"} className="text-xs capitalize">
                    {doctor?.status}
                  </Badge>
                )}
                {!loading && doctor?.phone && (
                  <Badge variant="outline" className="text-xs text-muted-foreground gap-1 font-normal bg-muted/30">
                    <Hash className="h-3 w-3" />
                    {doctor.phone}
                  </Badge>
                )}
                {!loading && doctor?.address && (
                  <Badge variant="outline" className="text-xs text-muted-foreground gap-1 font-normal bg-muted/30">
                    <Building2 className="h-3 w-3" />
                    {doctor.address}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid gap-3 md:grid-cols-4">
            {[
              { label: "Total Appointments", value: appointments.length, color: "border-l-primary" },
              { label: "Active / Upcoming", value: totalActive, color: "border-l-blue-500" },
              { label: "Completed", value: totalCompleted, color: "border-l-emerald-500" },
              { label: "Cancelled", value: totalCancelled, color: "border-l-red-400" },
            ].map((stat) => (
              <Card key={stat.label} className={`border-l-4 ${stat.color} transition-all hover:shadow-md`}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Weekly Schedule Grid */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-primary" />
                Weekly Appointment Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day, idx) => {
                  const dayAppts = byDay[day] ?? []
                  const isToday = day === todayName
                  const maxCount = Math.max(...DAYS.map((d) => byDay[d]?.length ?? 0), 1)
                  const barHeight = Math.max((dayAppts.length / maxCount) * 80, dayAppts.length > 0 ? 12 : 4)

                  return (
                    <button
                      key={day}
                      onClick={() => setActiveDay(activeDay === day ? "all" : day)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all border ${
                        activeDay === day
                          ? "border-primary bg-primary/5"
                          : isToday
                          ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30"
                          : "border-transparent hover:bg-muted"
                      }`}
                    >
                      <span className={`text-[10px] font-semibold uppercase tracking-wide ${isToday ? "text-blue-600" : "text-muted-foreground"}`}>
                        {DAY_SHORT[idx]}
                      </span>
                      {/* Bar */}
                      <div className="flex flex-col justify-end" style={{ height: 80 }}>
                        <div
                          className={`w-5 rounded-t-sm transition-all ${
                            dayAppts.length > 0 ? "bg-primary/70" : "bg-muted"
                          } ${activeDay === day ? "bg-primary" : ""}`}
                          style={{ height: barHeight }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${dayAppts.length > 0 ? "" : "text-muted-foreground"}`}>
                        {dayAppts.length}
                      </span>
                      {isToday && (
                        <span className="text-[9px] text-blue-600 font-medium">Today</span>
                      )}
                    </button>
                  )
                })}
              </div>
              {activeDay !== "all" && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Showing {activeDay} appointments — <button onClick={() => setActiveDay("all")} className="text-primary underline">show all</button>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Appointment List */}
          <Card className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-primary" />
                  {activeDay === "all" ? "All Appointments" : `${activeDay} Appointments`}
                  <span className="text-sm font-normal text-muted-foreground">({displayedAppts.length})</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {displayedAppts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No appointments {activeDay !== "all" ? `on ${activeDay}` : "found"}.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {displayedAppts.map((a) => {
                    const sc = statusConfig[a.status] ?? statusConfig.scheduled
                    return (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${sc.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">
                              #{a.appointNo} — {a.type}
                            </span>
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${sc.classes}`}>
                              {sc.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {a.patient?.fullName || `Patient #${a.patientId}`}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {a.date ? new Date(a.date).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {a.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              Token {a.tokenNo}
                            </span>
                          </div>
                          {a.reason && (
                            <p className="text-xs text-muted-foreground italic mt-0.5">"{a.reason}"</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium">{a.day}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
