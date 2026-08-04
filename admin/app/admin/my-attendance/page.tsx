"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { CalendarCheck, Clock, LogIn, LogOut, CheckCircle2, AlertCircle, Calendar, ShieldCheck, History } from "lucide-react"
import axios from "axios"

function getApiUrl() {
  const envBase = process.env.NEXT_PUBLIC_API_URL
  if (envBase) return envBase.endsWith('/api') ? envBase : `${envBase.replace(/\/$/, '')}/api`
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:5001/api`
  }
  return "http://localhost:5001/api"
}

interface AttendanceRecord {
  id: number
  employeeId: number
  date: string
  status: string
  checkIn: string | null
  checkOut: string | null
  notes: string | null
}

export default function MyAttendancePage() {
  const { user, token } = useAuth()
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null)
  const [history, setHistory] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState("")
  const [currentTime, setCurrentTime] = useState<string>("")
  const [currentDate, setCurrentDate] = useState<string>("")

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }))
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch Attendance Data
  const fetchData = async () => {
    if (!token || !user?.id) return
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      
      const [todayRes, historyRes] = await Promise.all([
        axios.get(`${getApiUrl()}/attendance/employee/${user.id}/today`, { headers }),
        axios.get(`${getApiUrl()}/attendance/employee/${user.id}/history`, { headers })
      ])

      setTodayAttendance(todayRes.data)
      setHistory(historyRes.data)
    } catch (err: any) {
      console.error("Error fetching attendance data:", err)
      toast({
        title: "Unable to load attendance data",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token, user?.id])

  // Handle Mark Check-In / Check-Out
  const handleMarkAttendance = async (action: 'checkIn' | 'checkOut') => {
    if (!user?.id || !token) return
    setSubmitting(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const res = await axios.post(
        `${getApiUrl()}/attendance/employee/mark`,
        {
          employeeId: user.id,
          action,
          notes: notes.trim() || undefined,
        },
        { headers }
      )

      toast({
        title: action === 'checkIn' ? "Checked In!" : "Checked Out!",
        description: res.data.message || `Successfully marked ${action}`,
      })
      setNotes("")
      fetchData()
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to record attendance"
      toast({
        title: "Attendance Error",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate monthly statistics
  const presentCount = history.filter(h => h.status === 'Present' || h.status === 'Late').length
  const lateCount = history.filter(h => h.status === 'Late').length

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Present</Badge>
      case 'late':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Late</Badge>
      case 'absent':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-200">Absent</Badge>
      case 'on leave':
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-200">On Leave</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isCheckedIn = Boolean(todayAttendance && todayAttendance.checkIn)
  const isCheckedOut = Boolean(todayAttendance && todayAttendance.checkOut)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Employee Attendance Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mark your daily check-in and check-out, view status, and track monthly attendance history.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium bg-secondary px-3 py-1.5 rounded-lg text-secondary-foreground border">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{currentDate}</span>
        </div>
      </div>

      {/* Main Attendance Card + Clock Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Clock & Action Card (2 cols) */}
        <Card className="md:col-span-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Daily Attendance Marking</CardTitle>
                  <CardDescription>Click to record your check-in or check-out for today</CardDescription>
                </div>
              </div>
              <div>
                {isCheckedOut ? (
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 px-3 py-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Shift Completed
                  </Badge>
                ) : isCheckedIn ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 px-3 py-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Checked In ({todayAttendance?.checkIn})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-500/5 px-3 py-1 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Not Checked In
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Live Clock Display */}
            <div className="flex flex-col items-center justify-center p-6 bg-background/80 backdrop-blur rounded-xl border shadow-sm">
              <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-1">Current Time</span>
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary font-mono">{currentTime || "--:--:--"}</span>
              <span className="text-xs text-muted-foreground mt-2 font-medium">{currentDate}</span>
            </div>

            {/* Attendance Details & Notes Input */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground">Optional Work Notes / Remarks</label>
              <Input
                placeholder="e.g. Working remotely, Morning shift, Duty at Ward B..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={submitting || isCheckedOut}
                className="bg-background"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                size="lg"
                onClick={() => handleMarkAttendance('checkIn')}
                disabled={submitting || isCheckedIn}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold shadow-md disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" />
                {isCheckedIn ? `Checked In (${todayAttendance?.checkIn})` : "Clock In / Check In"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => handleMarkAttendance('checkOut')}
                disabled={submitting || !isCheckedIn || isCheckedOut}
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 gap-2 font-semibold shadow-sm disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" />
                {isCheckedOut ? `Checked Out (${todayAttendance?.checkOut})` : "Clock Out / Check Out"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary Widget (1 col) */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Monthly Overview</span>
                <CalendarCheck className="w-4 h-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{presentCount} Days</div>
              <p className="text-xs text-muted-foreground mt-1">Total days present this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Punctuality</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{lateCount} Late</div>
              <p className="text-xs text-muted-foreground mt-1">Late check-in instances recorded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                <span>Logged Account</span>
                <ShieldCheck className="w-4 h-4 text-teal-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-semibold truncate">{user?.name || "Employee"}</div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Recent Attendance History</CardTitle>
                <CardDescription>Your logged attendance history across past shifts</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading}>
              Refresh Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading attendance logs...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No attendance records found yet.</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell className="font-mono text-xs">{record.checkIn || "--:--"}</TableCell>
                      <TableCell className="font-mono text-xs">{record.checkOut || "--:--"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {record.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
