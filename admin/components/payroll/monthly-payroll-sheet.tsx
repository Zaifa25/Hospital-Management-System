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
import { Skeleton } from "@/components/ui/skeleton"

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

// Generate last 12 months + next 12 months
const generateMonths = () => {
  const months = []
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  for (let i = -12; i <= 12; i++) {
    const d = new Date(currentYear, currentMonth + i, 1)
    months.push(d.toLocaleString('default', { month: 'long', year: 'numeric' }))
  }
  return months
}
const monthsList = generateMonths()

export function MonthlyPayrollSheet({
  open,
  onOpenChange,
  onSubmitted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitted: () => void
}) {
  const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr)
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
          axios.get(apiUrl(`/payrolls?month=${selectedMonth}`), { headers }), // We could filter on backend, but let's fetch all or filter client side
        ])

        const employeesList: Employee[] = Array.isArray(empRes.data) ? empRes.data : empRes.data.data || []
        const payrollsList: any[] = Array.isArray(payRes.data) ? payRes.data : payRes.data.data || []

        const monthPayMap = new Map(
          payrollsList
            .filter((p) => p.month === selectedMonth)
            .map((p) => [Number(p.employeeId), p])
        )

        setRows(
          employeesList.filter(emp => emp.status !== 'resigned').map((emp) => {
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

  const handleValueChange = (index: number, field: "bonus" | "deductions", value: string) => {
    const num = value === "" ? 0 : Number(value)
    if (isNaN(num)) return
    
    setRows((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: num }
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

      // Save entries for each employee sequentially (or use Promise.all in production for speed)
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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            Monthly Staff Payroll Sheet
          </DialogTitle>
          <DialogDescription>
            Select a month, adjust employee bonuses/deductions, and toggle payment status for all staff.
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
                <SelectTrigger id="month-select" className="w-56 h-9 bg-background">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
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
                className="text-xs gap-1 text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 shadow-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark All Paid ({rows.length})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleMarkAll("Pending")}
                className="text-xs gap-1 text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100 shadow-sm"
              >
                <Clock className="h-3.5 w-3.5" />
                Set All Pending
              </Button>
            </div>
          </div>

          {/* Employee Sheet Table */}
          {loadingEmployees ? (
            <div className="py-12 space-y-4">
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          ) : (
            <div className="border rounded-xl overflow-hidden divide-y text-sm bg-background shadow-sm">
              <div className="bg-muted/60 px-4 py-3 font-semibold text-xs text-muted-foreground grid grid-cols-12 gap-3 uppercase tracking-wider">
                <div className="col-span-3">EMPLOYEE</div>
                <div className="col-span-2 text-right">BASIC</div>
                <div className="col-span-2">BONUS</div>
                <div className="col-span-2">DEDUCTIONS</div>
                <div className="col-span-1 text-right">NET</div>
                <div className="col-span-2 text-right">STATUS</div>
              </div>

              {rows.map((row, idx) => {
                const net = row.basicSalary + row.bonus - row.deductions
                const isPaid = row.status === "Paid"
                return (
                  <div key={row.employeeId} className="p-3.5 grid grid-cols-12 gap-3 items-center hover:bg-muted/30 transition-colors">
                    {/* Employee Details */}
                    <div className="col-span-3 min-w-0">
                      <p className="font-semibold text-foreground truncate">{row.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {row.designation} &bull; <span className="font-medium text-primary/80">{row.departmentName}</span>
                      </p>
                    </div>

                    {/* Basic Salary */}
                    <div className="col-span-2 text-right text-muted-foreground font-medium flex items-center justify-end">
                      ₨ {row.basicSalary.toLocaleString()}
                    </div>

                    {/* Bonus Input */}
                    <div className="col-span-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₨</span>
                        <Input 
                          type="number" 
                          min="0"
                          value={row.bonus || ""}
                          onChange={(e) => handleValueChange(idx, "bonus", e.target.value)}
                          className="h-8 pl-6 text-xs text-emerald-600 font-medium bg-background"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Deductions Input */}
                    <div className="col-span-2">
                       <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₨</span>
                        <Input 
                          type="number" 
                          min="0"
                          value={row.deductions || ""}
                          onChange={(e) => handleValueChange(idx, "deductions", e.target.value)}
                          className="h-8 pl-6 text-xs text-red-600 font-medium bg-background"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Net Salary Calculation */}
                    <div className="col-span-1 flex items-center justify-end">
                      <p className="font-bold text-foreground text-sm">₨ {net.toLocaleString()}</p>
                    </div>

                    {/* Status Button */}
                    <div className="col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(idx)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                          isPaid
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
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
              
              {rows.length === 0 && !loadingEmployees && (
                <div className="p-8 text-center text-muted-foreground">
                  No active employees found for this month.
                </div>
              )}
            </div>
          )}

          {/* Sheet Footer */}
          <div className="flex items-center justify-between pt-5 border-t">
            <div>
              <div className="flex items-center gap-4 text-sm mb-1">
                <span className="text-muted-foreground">Total Staff: <strong className="text-foreground">{rows.length}</strong></span>
                <span className="text-muted-foreground">Paid: <strong className="text-emerald-600">{paidCount}</strong></span>
                <span className="text-muted-foreground">Pending: <strong className="text-amber-600">{rows.length - paidCount}</strong></span>
              </div>
              <p className="text-lg font-bold text-foreground mt-1">
                Net Payout Budget: <span className="text-emerald-600 tracking-tight">₨ {totalExpense.toLocaleString()}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={submitting || rows.length === 0} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                <Sparkles className="h-4 w-4" />
                {submitting ? "Saving Sheet..." : `Save Payroll Sheet (${rows.length})`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
