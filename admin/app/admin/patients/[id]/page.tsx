"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  User,
  Calendar,
  CreditCard,
  Phone,
  MapPin,
  Briefcase,
  Heart,
  Hash,
  Clock,
  CheckCircle,
  XCircle,
  CheckCheck,
  AlertCircle,
} from "lucide-react"

const statusConfig: Record<string, { label: string; icon: React.ElementType; classes: string }> = {
  scheduled: { label: "Scheduled", icon: Clock, classes: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Confirmed", icon: CheckCircle, classes: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Completed", icon: CheckCheck, classes: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", icon: XCircle, classes: "bg-red-100 text-red-700" },
}

const paymentStatusConfig: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium capitalize">{String(value)}</span>
    </div>
  )
}

export default function PatientHistoryPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("hms_jwt")
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        const base = "http://localhost:5000/api"

        const [patientRes, apptRes, payRes] = await Promise.all([
          axios.get(`${base}/patients/${id}`, { headers }),
          axios.get(`${base}/appointments`, { headers }),
          axios.get(`${base}/payments`, { headers }),
        ])

        setPatient(patientRes.data)

        const normalize = (d: any): any[] => (Array.isArray(d) ? d : d?.data || d?.items || [])
        const allAppts = normalize(apptRes.data)
        const allPays = normalize(payRes.data)

        setAppointments(
          allAppts.filter((a: any) => String(a.patientId) === String(id))
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        )
        setPayments(
          allPays.filter((p: any) => String(p.patientId) === String(id))
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        )
      } catch (err) {
        console.error("Failed to load patient history:", err)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const totalPaid = payments.reduce((s, p) => s + (Number(p.paid) || 0), 0)
  const totalBalance = payments.reduce((s, p) => s + (Number(p.netTotal) || 0) - (Number(p.paid) || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {loading ? <Skeleton className="h-7 w-48" /> : patient?.fullName ?? "Patient History"}
          </h1>
          <div className="text-sm text-muted-foreground">
            {loading ? <Skeleton className="h-4 w-32 mt-1" /> : `MR# ${patient?.mrNo}`}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <>
          {/* Patient Profile + Summary */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Profile Card */}
            <Card className="lg:col-span-2 transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-primary" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                  <InfoRow label="Full Name" value={patient?.fullName} />
                  <InfoRow label="MR Number" value={patient?.mrNo} />
                  <InfoRow label="Age" value={patient?.age} />
                  <InfoRow label="Sex" value={patient?.sex} />
                  <InfoRow label="Marital Status" value={patient?.maritalStatus} />
                  <InfoRow label="Membership" value={patient?.membership} />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Phone</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {patient?.phone}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Address</span>
                    <span className="text-sm font-medium flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 shrink-0" /> {patient?.address}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Occupation</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> {patient?.occupation || "—"}
                    </span>
                  </div>
                  <div className="col-span-full flex items-center gap-2 mt-1">
                    <Badge variant={patient?.status === "active" ? "default" : "secondary"} className="capitalize">
                      {patient?.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Registered: {patient?.registration ? new Date(patient.registration).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <div className="space-y-3">
              <Card className="border-l-4 border-l-primary transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Total Appointments</p>
                  <p className="text-3xl font-bold mt-1">{appointments.length}</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-emerald-500 transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    ₨ {totalPaid.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
              <Card className={`border-l-4 ${totalBalance > 0 ? "border-l-amber-500" : "border-l-slate-300"} transition-all hover:shadow-md`}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Outstanding Balance</p>
                  <p className={`text-2xl font-bold mt-1 ${totalBalance > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                    ₨ {totalBalance.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Timeline: Appointments + Payments */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Appointments Timeline */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4 text-primary" />
                  Appointments ({appointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No appointments found.</p>
                ) : (
                  <div className="relative space-y-0">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
                    <div className="space-y-3">
                      {appointments.map((a, i) => {
                        const sc = statusConfig[a.status] ?? statusConfig.scheduled
                        const Icon = sc.icon
                        return (
                          <div key={a.id} className="flex gap-3 pl-10 relative">
                            {/* Timeline dot */}
                            <div
                              className={`absolute left-2 top-2 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center ${sc.classes}`}
                            >
                              <Icon className="h-2.5 w-2.5" />
                            </div>
                            <div className="flex-1 rounded-lg border p-3 bg-muted/30 hover:bg-muted/60 transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium">#{a.appointNo} — {a.type}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {a.date ? new Date(a.date).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                    {" at "}{a.time} · {a.day}
                                  </p>
                                  {a.reason && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">"{a.reason}"</p>
                                  )}
                                </div>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${sc.classes}`}>
                                  {sc.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payments Timeline */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Payment Records ({payments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No payment records found.</p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((p) => {
                      const balance = (Number(p.netTotal) || 0) + (Number(p.xrayCharge) || 0) - (Number(p.paid) || 0) - (Number(p.xrayPaid) || 0)
                      const statusClass = paymentStatusConfig[p.status] ?? "bg-gray-100 text-gray-700"
                      return (
                        <div key={p.id} className="rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-medium">
                                {p.date ? new Date(p.date).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">{p.method}</p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                              {p.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">Net Total</p>
                              <p className="font-semibold">₨ {Number(p.netTotal || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Paid</p>
                              <p className="font-semibold text-emerald-600">₨ {Number(p.paid || 0).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Balance</p>
                              <p className={`font-semibold ${balance > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                                ₨ {balance.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          {(Number(p.xrayCharge) > 0) && (
                            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                              X-Ray: Charge ₨ {Number(p.xrayCharge).toFixed(2)} / Paid ₨ {Number(p.xrayPaid || 0).toFixed(2)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
