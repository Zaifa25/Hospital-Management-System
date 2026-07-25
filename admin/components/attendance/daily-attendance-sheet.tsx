"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { apiUrl } from "@/lib/env"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Calendar, CheckCircle2, Clock, UserCheck, AlertCircle, Sparkles } from "lucide-react"

type Employee = {
  id: number
  name: string
  designation: string
  type: string
  department?: { name: string }
}

type AttendanceRow = {
  employeeId: number
  name: string
  designation: string
  departmentName: string
  status: "Present" | "Late" | "Half-day" | "On Leave" | "Absent"
  checkIn: string
  checkOut: string
  notes: string
}

export function DailyAttendanceSheet({
  open,
  onOpenChange,
  onSubmitted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitted: () => void
}) {
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [rows, setRows] = useState<AttendanceRow[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    async function fetchEmployees() {
      setLoadingEmployees(true)
      try {
        const token = localStorage.getItem("hms_jwt")
        const res = await axios.get(apiUrl("/employees"), {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        })
        const employeesList: Employee[] = Array.isArray(res.data) ? res.data : res.data.data || []

        setRows(
          employeesList.map((emp) => ({
            employeeId: emp.id,
            name: emp.name,
            designation: emp.designation,
            departmentName: emp.department?.name || "General",
            status: "Present",
            checkIn: "09:00 AM",
            checkOut: "05:00 PM",
            notes: "",
          }))
        )
      } catch (err) {
        toast({ title: "Failed to load employee list", variant: "destructive" })
      } finally {
        setLoadingEmployees(false)
      }
    }

    fetchEmployees()
  }, [open])

  const handleStatusChange = (index: number, newStatus: AttendanceRow["status"]) => {
    setRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], status: newStatus }
      if (newStatus === "Absent" || newStatus === "On Leave") {
        next[index].checkIn = ""
        next[index].checkOut = ""
      } else if (!next[index].checkIn) {
        next[index].checkIn = "09:00 AM"
        next[index].checkOut = "05:00 PM"
      }
      return next
    })
  }

  const handleMarkAll = (status: AttendanceRow["status"]) => {
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        status,
        checkIn: status === "Absent" || status === "On Leave" ? "" : "09:00 AM",
        checkOut: status === "Absent" || status === "On Leave" ? "" : "05:00 PM",
      }))
    )
  }

  const handleSubmit = async () => {
    if (rows.length === 0) return
    setSubmitting(true)

    try {
      const token = localStorage.getItem("hms_jwt")
      await axios.post(
        apiUrl("/attendance/bulk"),
        {
          date,
          records: rows.map((r) => ({
            employeeId: r.employeeId,
            status: r.status,
            checkIn: r.checkIn,
            checkOut: r.checkOut,
            notes: r.notes,
          })),
        },
        { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
      )

      toast({
        title: "Daily Attendance Submitted!",
        description: `Successfully marked attendance for ${rows.length} employees on ${date}.`,
      })

      onOpenChange(false)
      onSubmitted()
    } catch (err: any) {
      toast({
        title: "Failed to submit attendance",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserCheck className="h-6 w-6 text-primary" />
            Daily Attendance Sheet
          </DialogTitle>
          <DialogDescription>
            Select date and mark attendance for all hospital employees.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Top Bar: Date selection & Bulk actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted/40 rounded-xl border">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="att-date" className="font-semibold">
                Date:
              </Label>
              <Input
                id="att-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-40 h-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll("Present")}
                className="text-xs gap-1 text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                All Present
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll("On Leave")}
                className="text-xs gap-1 text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100"
              >
                All On Leave
              </Button>
            </div>
          </div>

          {/* Employee Sheet Table */}
          {loadingEmployees ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <Clock className="h-8 w-8 animate-spin mx-auto opacity-50" />
              <p>Loading employee directory...</p>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden divide-y text-sm">
              <div className="bg-muted/50 px-4 py-2.5 font-semibold text-xs text-muted-foreground grid grid-cols-12 gap-2">
                <div className="col-span-4">EMPLOYEE</div>
                <div className="col-span-4">ATTENDANCE STATUS</div>
                <div className="col-span-4">CHECK-IN / OUT & NOTES</div>
              </div>

              {rows.map((row, idx) => (
                <div key={row.employeeId} className="p-3.5 grid grid-cols-12 gap-3 items-center hover:bg-muted/20 transition-colors">
                  {/* Employee Details */}
                  <div className="col-span-4 min-w-0">
                    <p className="font-medium text-foreground truncate">{row.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {row.designation} &bull; <span className="font-semibold text-primary">{row.departmentName}</span>
                    </p>
                  </div>

                  {/* Status Buttons */}
                  <div className="col-span-4 flex flex-wrap gap-1">
                    {[
                      { status: "Present", color: "bg-emerald-600 text-white" },
                      { status: "Late", color: "bg-amber-500 text-white" },
                      { status: "Half-day", color: "bg-blue-600 text-white" },
                      { status: "On Leave", color: "bg-purple-600 text-white" },
                      { status: "Absent", color: "bg-red-600 text-white" },
                    ].map((st) => (
                      <button
                        key={st.status}
                        type="button"
                        onClick={() => handleStatusChange(idx, st.status as AttendanceRow["status"])}
                        className={`px-2 py-1 text-xs rounded-md font-medium transition-all ${
                          row.status === st.status
                            ? `${st.color} shadow-sm scale-105`
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {st.status}
                      </button>
                    ))}
                  </div>

                  {/* CheckIn / CheckOut & Notes */}
                  <div className="col-span-4 space-y-1.5">
                    {row.status !== "Absent" && row.status !== "On Leave" && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="In (09:00 AM)"
                          value={row.checkIn}
                          onChange={(e) => {
                            const val = e.target.value
                            setRows((prev) => {
                              const next = [...prev]
                              next[idx].checkIn = val
                              return next
                            })
                          }}
                          className="h-7 text-xs px-2"
                        />
                        <Input
                          placeholder="Out (05:00 PM)"
                          value={row.checkOut}
                          onChange={(e) => {
                            const val = e.target.value
                            setRows((prev) => {
                              const next = [...prev]
                              next[idx].checkOut = val
                              return next
                            })
                          }}
                          className="h-7 text-xs px-2"
                        />
                      </div>
                    )}
                    <Input
                      placeholder="Notes (optional)"
                      value={row.notes}
                      onChange={(e) => {
                        const val = e.target.value
                        setRows((prev) => {
                          const next = [...prev]
                          next[idx].notes = val
                          return next
                        })
                      }}
                      className="h-7 text-xs px-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Total Staff: <strong className="text-foreground">{rows.length}</strong>
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={submitting || rows.length === 0} className="gap-2">
                <Sparkles className="h-4 w-4" />
                {submitting ? "Saving Sheet..." : `Save Attendance (${rows.length})`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
