"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { apiUrl } from "@/lib/env"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { DollarSign, CheckCircle2, Clock, Sparkles, UserCheck } from "lucide-react"

type Employee = {
  id: number
  name: string
  designation: string
  type: string
  salary?: number
  department?: { name: string }
}

type PayrollRow = {
  employeeId: number
  name: string
  designation: string
  departmentName: string
  basicSalary: number
  bonus: number
  deductions: number
  status: "Pending" | "Paid"
}

const monthsList = [
  "January 2026", "February 2026", "March 2026", "April 2026",
  "May 2026", "June 2026", "July 2026", "August 2026",
  "September 2026", "October 2026", "November 2026", "December 2026"
]

export function MonthlyPayrollSheet({
  open,
  onOpenChange,
  onSubmitted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitted: () => void
}) {
  const [selectedMonth, setSelectedMonth] = useState<string>("July 2026")
  const [rows, setRows] = useState<PayrollRow[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    async function fetchEmployeesAndExistingPayroll() {
      setLoadingEmployees(true)
      try {
        const token = localStorage.getItem("hms_jwt")
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) }

        const [empRes, payRes] = await Promise.all([
          axios.get(apiUrl("/employees"), { headers }),
          axios.get(apiUrl("/payrolls"), { headers }),
        ])

        const employeesList: Employee[] = Array.isArray(empRes.data) ? empRes.data : empRes.data.data || []
        const payrollsList: any[] = Array.isArray(payRes.data) ? payRes.data : payRes.data.data || []

        const monthPayMap = new Map(
          payrollsList
            .filter((p) => p.month === selectedMonth)
            .map((p) => [Number(p.employeeId), p])
        )

        setRows(
          employeesList.map((emp) => {
            const existing = monthPayMap.get(emp.id)
            return {
              employeeId: emp.id,
              name: emp.name,
              designation: emp.designation || emp.type,
              departmentName: emp.department?.name || "General",
              basicSalary: existing ? Number(existing.basicSalary) : Number(emp.salary) || 50000,
              bonus: existing ? Number(existing.bonus) || 0 : 0,
              deductions: existing ? Number(existing.deductions) || 0 : 0,
              status: existing ? existing.status : "Pending",
            }
          })
        )
      } catch (err) {
        toast({ title: "Failed to load employees or payroll", variant: "destructive" })
      } finally {
        setLoadingEmployees(false)
      }
    }

    fetchEmployeesAndExistingPayroll()
  }, [open, selectedMonth])

  const handleStatusToggle = (index: number) => {
    setRows((prev) => {
      const next = [...prev]
      const current = next[index].status
      next[index] = { ...next[index], status: current === "Paid" ? "Pending" : "Paid" }
      return next
    })
  }

  const handleMarkAll = (status: "Pending" | "Paid") => {
    setRows((prev) => prev.map((r) => ({ ...r, status })))
  }

  const handleSubmit = async () => {
    if (rows.length === 0) return
    setSubmitting(true)

    try {
      const token = localStorage.getItem("hms_jwt")
      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) }

      // Save entries for each employee
      for (const r of rows) {
        await axios.post(
          apiUrl("/payrolls"),
          {
            employeeId: r.employeeId,
            month: selectedMonth,
            basicSalary: r.basicSalary,
            bonus: r.bonus,
            deductions: r.deductions,
            status: r.status,
          },
          { headers }
        )
      }

      toast({
        title: `Payroll Updated for ${selectedMonth}!`,
        description: `Successfully processed monthly payroll for ${rows.length} staff members.`,
      })

      onOpenChange(false)
      onSubmitted()
    } catch (err: any) {
      toast({
        title: "Failed to submit payroll sheet",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const totalExpense = rows.reduce((sum, r) => sum + (r.basicSalary + r.bonus - r.deductions), 0)
  const paidCount = rows.filter((r) => r.status === "Paid").length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            Monthly Staff Payroll Sheet
          </DialogTitle>
          <DialogDescription>
            Select a month, review employee salaries, and toggle payment status for all staff.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Top Bar: Month Selection & Quick Fill */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-muted/40 rounded-xl border">
            <div className="flex items-center gap-2">
              <Label htmlFor="month-select" className="font-semibold text-sm">
                Payroll Month:
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="month-select" className="w-48 h-9 bg-background">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {monthsList.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll("Paid")}
                className="text-xs gap-1 text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark All Paid ({rows.length})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll("Pending")}
                className="text-xs gap-1 text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
              >
                <Clock className="h-3.5 w-3.5" />
                Set All Pending
              </Button>
            </div>
          </div>

          {/* Employee Sheet Table */}
          {loadingEmployees ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <Clock className="h-8 w-8 animate-spin mx-auto opacity-50" />
              <p>Loading payroll sheet for {selectedMonth}...</p>
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden divide-y text-sm">
              <div className="bg-muted/50 px-4 py-2.5 font-semibold text-xs text-muted-foreground grid grid-cols-12 gap-2">
                <div className="col-span-4">EMPLOYEE NAME & ROLE</div>
                <div className="col-span-4">BASIC & NET SALARY</div>
                <div className="col-span-4 text-right">PAYOUT STATUS</div>
              </div>

              {rows.map((row, idx) => {
                const net = row.basicSalary + row.bonus - row.deductions
                const isPaid = row.status === "Paid"
                return (
                  <div key={row.employeeId} className="p-3.5 grid grid-cols-12 gap-3 items-center hover:bg-muted/20 transition-colors">
                    {/* Employee Details */}
                    <div className="col-span-4 min-w-0">
                      <p className="font-medium text-foreground truncate">{row.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {row.designation} &bull; <span className="font-semibold text-primary">{row.departmentName}</span>
                      </p>
                    </div>

                    {/* Salary Calculation */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Basic: ₨ {row.basicSalary.toLocaleString()}</p>
                        <p className="font-bold text-emerald-600 text-sm">Net: ₨ {net.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Status Button */}
                    <div className="col-span-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(idx)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                          isPaid
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                        }`}
                      >
                        {isPaid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        {isPaid ? "PAID" : "PENDING"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Sheet Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">
                Total Employees: <strong className="text-foreground">{rows.length}</strong> &bull; Paid:{" "}
                <strong className="text-emerald-600">{paidCount}</strong>
              </p>
              <p className="text-sm font-bold text-emerald-700">
                Total Budget: ₨ {totalExpense.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={submitting || rows.length === 0} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Sparkles className="h-4 w-4" />
                {submitting ? "Saving Sheet..." : `Save Monthly Payroll (${rows.length})`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
