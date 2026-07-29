"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DataTable } from "./data-table"
import { EntityForm } from "./entity-form"
import { useState, useMemo, useEffect } from "react"
import axios from "axios"
import { toast } from "@/hooks/use-toast"
import { fetchJSON, mutateWithAuth } from "@/lib/api-client"
import type { EntityConfig } from "@/lib/entities"
import { useRouter } from "next/navigation"
import { apiUrl } from "@/lib/env"
import { DailyAttendanceSheet } from "@/components/attendance/daily-attendance-sheet"
import { SalarySlipModal } from "@/components/payroll/salary-slip-modal"
import { MonthlyPayrollSheet } from "@/components/payroll/monthly-payroll-sheet"
import { UserCheck, DollarSign, CheckCircle2, Clock, Sparkles, Receipt, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Helper for dynamic months
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
const currentMonthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

export function CRUDPage({ config }: { config: EntityConfig }) {
  const [query, setQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [monthFilter, setMonthFilter] = useState<string>(config.key === "payroll" ? currentMonthStr : "All")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editing, setEditing] = useState<any | null>(null)
  const [openForm, setOpenForm] = useState(false)
  const [openSheet, setOpenSheet] = useState(false)
  const [openMonthlySheet, setOpenMonthlySheet] = useState(false)
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null)
  const [openSlipModal, setOpenSlipModal] = useState(false)
  const [generatingPayroll, setGeneratingPayroll] = useState(false)
  const router = useRouter()

  // Modals for confirmation
  const [confirmGenerateOpen, setConfirmGenerateOpen] = useState(false)
  const [confirmMarkPaidOpen, setConfirmMarkPaidOpen] = useState(false)

  const params = useMemo(
    () => new URLSearchParams({ q: query, page: String(page), pageSize: String(pageSize) }).toString(),
    [query, page, pageSize],
  )

  const swrKey = `${apiUrl(config.endpoint)}?${params}`

  const fetcher = async (url: string) => {
    const token = localStorage.getItem("hms_jwt")
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    
    // For payroll, let's use the summary endpoint as well to get accurate stats
    let summaryData = null;
    if (config.key === "payroll" && monthFilter !== "All") {
       try {
         const sumRes = await axios.get(apiUrl(`/payrolls/summary?month=${monthFilter}`), { headers });
         summaryData = sumRes.data;
       } catch (e) { 
         // ignore summary fetch error gracefully
       }
    }

    try {
      const res = await axios.get(url, { headers })
      const d = res.data

      // Normalize items from various backend shapes
      let items: any[] = []
      if (Array.isArray(d)) {
        items = d
      } else if (d && Array.isArray(d.items)) {
        items = d.items
      } else if (d && Array.isArray(d.data)) {
        items = d.data
      }

      // If appointments, fetch related resources and attach names where possible
      if (config.key === "appointments") {
        try {
          const [pRes, docRes, depRes] = await Promise.all([
            axios.get(apiUrl("/patients"), { headers }),
            axios.get(apiUrl("/doctors"), { headers }),
            axios.get(apiUrl("/departments"), { headers }),
          ])

          const patientsArr = pRes.data.data || pRes.data.items || pRes.data || []
          const doctorsArr = docRes.data.data || docRes.data.items || docRes.data || []
          const deptsArr = depRes.data.data || depRes.data.items || depRes.data || []

          const pMap = new Map(patientsArr.map((p: any) => [String(p.id), p]))
          const dMap = new Map(doctorsArr.map((d: any) => [String(d.id), d]))
          const deptMap = new Map(deptsArr.map((d: any) => [String(d.id), d]))

          items = items.map((item: any) => ({
            ...item,
            patient: item.patient || pMap.get(String(item.patientId)) || null,
            doctor: item.doctor || dMap.get(String(item.doctorId)) || null,
            department: item.department || deptMap.get(String(item.departmentId)) || null,
          }))
        } catch (err) {
          items = items.map((item: any) => ({
            ...item,
            patient: item.patient || { fullName: item.patientName || `Patient ${item.patientId}` },
            doctor: item.doctor || { name: item.doctorName || `Doctor ${item.doctorId}` },
            department: item.department || { name: item.departmentName || `Department ${item.departmentId}` },
          }))
        }
      }

      return {
        items,
        total: typeof d.total === "number" ? d.total : items.length,
        summary: summaryData
      }
    } catch (err) {
      console.warn("API fetch error in CRUDPage:", err)
      return { items: [], total: 0, summary: null }
    }
  }

  const { data, isLoading, mutate } = useSWR<{ items: any[]; total: number; summary?: any }>(swrKey, fetcher, {
    refreshInterval: 10000,
  })

  const rawItems = useMemo(() => data?.items ?? [], [data])

  const filteredItems = useMemo(() => {
    let result = rawItems

    if (config.key === "payroll") {
      if (monthFilter && monthFilter !== "All") {
        result = result.filter((item: any) => item.month === monthFilter)
      }
      if (statusFilter && statusFilter !== "All") {
        result = result.filter((item: any) => item.status === statusFilter)
      }
    }

    if (dateFilter) {
      result = result.filter((item: any) => {
        const itemDateStr = item.date || item.createdAt || item.paymentDate
        if (!itemDateStr) return false
        try {
          const d = new Date(itemDateStr).toISOString().split("T")[0]
          return d === dateFilter
        } catch {
          return false
        }
      })
    }

    if (!query.trim()) return result
    const q = query.toLowerCase().trim()
    return result.filter((item: any) => {
      return Object.values(item).some((val) => {
        if (val === null || val === undefined) return false
        if (typeof val === "object") {
          return Object.values(val).some((v) =>
            String(v ?? "").toLowerCase().includes(q)
          )
        }
        return String(val).toLowerCase().includes(q)
      })
    })
  }, [rawItems, query, dateFilter, monthFilter, statusFilter, config.key])

  const total = filteredItems.length

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredItems.slice(start, start + pageSize)
  }, [filteredItems, page, pageSize])

  const payrollStats = useMemo(() => {
    if (config.key !== "payroll") return null
    
    // Use server summary if available, otherwise calculate from filtered items
    if (data?.summary) {
       return data.summary;
    }

    let totalExpense = 0
    let paidNet = 0
    let pendingNet = 0
    let paidCount = 0
    let pendingCount = 0

    // Only calculate for the selected month to avoid huge numbers across years
    const itemsToSum = monthFilter === "All" ? filteredItems : rawItems.filter(i => i.month === monthFilter)

    itemsToSum.forEach((item: any) => {
      const net = Number(item.netSalary) || 0
      totalExpense += net
      if (item.status === "Paid") {
        paidNet += net
        paidCount++
      } else {
        pendingNet += net
        pendingCount++
      }
    })

    return { totalExpense, totalPaid: paidNet, totalPending: pendingNet, paidCount, pendingCount, totalRecords: paidCount + pendingCount }
  }, [config.key, data?.summary, rawItems, filteredItems, monthFilter])

  const handleMarkPaid = async (row: any) => {
    try {
      const token = localStorage.getItem("hms_jwt")
      // Using the toggle endpoint
      await axios.put(apiUrl(`/payrolls/${row.id}/pay`), {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      toast({
        title: row.status === "Paid" ? "Salary set to Pending" : "Salary Marked as Paid",
        description: `Successfully updated payout for ${row.employee?.name || `Employee #${row.employeeId}`}`,
      })
      mutate()
    } catch (err: any) {
      toast({
        title: "Failed to update salary status",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      })
    }
  }

  const handleGenerateMonthlyPayroll = async () => {
    setGeneratingPayroll(true)
    setConfirmGenerateOpen(false)
    try {
      const token = localStorage.getItem("hms_jwt")
      const res = await axios.post(
        apiUrl("/payrolls/generate"),
        { month: monthFilter === "All" ? currentMonthStr : monthFilter },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      toast({
        title: "Monthly Payroll Generated",
        description: res.data.message,
      })
      mutate()
    } catch (err: any) {
      toast({
        title: "Generation failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      })
    } finally {
      setGeneratingPayroll(false)
    }
  }

  const handleMarkAllPaid = async () => {
    setConfirmMarkPaidOpen(false)
    try {
      const token = localStorage.getItem("hms_jwt")
      const res = await axios.post(
        apiUrl("/payrolls/mark-all-paid"),
        { month: monthFilter === "All" ? currentMonthStr : monthFilter },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      toast({
        title: "All Salaries Paid!",
        description: res.data.message,
      })
      mutate()
    } catch (err: any) {
      toast({
        title: "Action failed",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      })
    }
  }

  async function handleDelete(row: any) {
    if (!window.confirm("Are you sure you want to delete this?")) return;
    try {
      const token = localStorage.getItem("hms_jwt")
      await axios.delete(apiUrl(`${config.endpoint}/${row.id}`), {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      toast({ title: `${config.title} deleted` })
      mutate()
    } catch {
      toast({ title: "Delete failed", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{config.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.key === "attendance" && (
            <Button
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
              onClick={() => setOpenSheet(true)}
            >
              <UserCheck className="h-4 w-4" />
              Mark Daily Attendance
            </Button>
          )}

          {config.key === "payroll" && (
            <>
              <Button
                variant="default"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm font-semibold"
                onClick={() => setOpenMonthlySheet(true)}
              >
                <DollarSign className="h-4 w-4" />
                Process Monthly Payroll Sheet
              </Button>
              <Button
                variant="outline"
                className="border-emerald-500 text-emerald-700 hover:bg-emerald-50 gap-2 shadow-sm"
                onClick={() => setConfirmGenerateOpen(true)}
                disabled={generatingPayroll}
              >
                <Sparkles className="h-4 w-4 text-emerald-600" />
                {generatingPayroll ? "Generating..." : "Auto-Generate Monthly Sheet"}
              </Button>
              <Button
                variant="outline"
                className="gap-2 shadow-sm"
                onClick={() => setConfirmMarkPaidOpen(true)}
                disabled={monthFilter === "All"}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Mark Month Paid
              </Button>
            </>
          )}

          <Button
            onClick={() => {
              setEditing(null)
              setOpenForm(true)
            }}
          >
            Create {config.single}
          </Button>
        </div>
      </div>

      {/* Payroll Professional Summary Stats */}
      {payrollStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 mb-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 opacity-80">Total Payroll Expense</p>
                <p className="text-2xl font-bold text-emerald-950">₨ {payrollStats.totalExpense.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm">
                <DollarSign className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1 opacity-80">Total Paid Out</p>
                <p className="text-2xl font-bold text-blue-950">₨ {payrollStats.totalPaid.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-sm">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/60 shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1 opacity-80">Total Pending</p>
                <p className="text-2xl font-bold text-amber-950">₨ {payrollStats.totalPending.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-sm">
                <Clock className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200/60 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-purple-700 uppercase tracking-wider opacity-80">Payout Progress</p>
                <div className="p-2 bg-purple-600 text-white rounded-lg shadow-sm">
                  <Receipt className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xl font-bold text-purple-950">
                    {payrollStats.paidCount} <span className="text-sm font-medium text-purple-700/60">/ {payrollStats.totalRecords} Paid</span>
                  </p>
                </div>
                <div className="w-1/2">
                   <div className="h-2 w-full bg-purple-200 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-purple-600 rounded-full" 
                       style={{ width: `${payrollStats.totalRecords > 0 ? (payrollStats.paidCount / payrollStats.totalRecords) * 100 : 0}%` }}
                     />
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="py-4 border-b bg-muted/20">
          <CardTitle className="text-sm font-medium flex items-center gap-2">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between flex-wrap">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder={`Search ${config.title.toLowerCase()}...`}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              className="max-w-xs shadow-sm"
            />

            {/* Month Filter Dropdown for Payroll */}
            {config.key === "payroll" ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Month:</span>
                  <Select
                    value={monthFilter}
                    onValueChange={(val) => {
                      setMonthFilter(val)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[180px] shadow-sm">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      <SelectItem value="All">All Months</SelectItem>
                      {monthsList.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Status:</span>
                  <Select
                    value={statusFilter}
                    onValueChange={(val) => {
                      setStatusFilter(val)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[140px] shadow-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Statuses</SelectItem>
                      <SelectItem value="Paid">Paid Only</SelectItem>
                      <SelectItem value="Pending">Pending Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              /* Date Filter Input */
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter Date:</span>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-40 h-9 shadow-sm"
                />
                {dateFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateFilter("")
                      setPage(1)
                    }}
                    className="h-9 px-2 text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground" htmlFor="pageSize">
              Rows per page
            </label>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val))
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[80px] h-9 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="bg-background border rounded-lg shadow-sm">
        <DataTable
          columns={config.columns({
            onEdit: (row: any) => {
              setEditing(row)
              setOpenForm(true)
            },
            onDelete: handleDelete,
            onNavigate: (path: string) => router.push(path),
            onStatusChange: () => mutate(),
            onViewSlip: (row: any) => {
              setSelectedSlip(row)
              setOpenSlipModal(true)
            },
            onMarkPaid: handleMarkPaid,
          })}
          data={paginatedItems}
          loading={isLoading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
      </div>

      <EntityForm
        open={openForm}
        onOpenChange={setOpenForm}
        config={config}
        defaultValues={editing ?? config.defaults}
        onSubmitted={() => {
          setOpenForm(false)
          // refresh table
          mutate()
        }}
      />

      {config.key === "attendance" && (
        <DailyAttendanceSheet
          open={openSheet}
          onOpenChange={setOpenSheet}
          onSubmitted={() => mutate()}
        />
      )}

      {config.key === "payroll" && (
        <>
          <SalarySlipModal
            open={openSlipModal}
            onOpenChange={setOpenSlipModal}
            payroll={selectedSlip}
          />
          <MonthlyPayrollSheet
            open={openMonthlySheet}
            onOpenChange={setOpenMonthlySheet}
            onSubmitted={() => mutate()}
          />

          {/* Confirm Generate Dialog */}
          <Dialog open={confirmGenerateOpen} onOpenChange={setConfirmGenerateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Monthly Payroll</DialogTitle>
                <DialogDescription>
                  This will auto-generate base payroll entries for all active employees for{" "}
                  <strong>{monthFilter === "All" ? currentMonthStr : monthFilter}</strong>. 
                  Existing entries for this month will not be overwritten.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmGenerateOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerateMonthlyPayroll} className="bg-primary text-primary-foreground">
                  Yes, Generate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Confirm Mark Paid Dialog */}
          <Dialog open={confirmMarkPaidOpen} onOpenChange={setConfirmMarkPaidOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark Entire Month as Paid</DialogTitle>
                <DialogDescription>
                  Are you sure you want to mark all pending salaries for <strong>{monthFilter}</strong> as Paid? 
                  This action will stamp the current date as the payment date for all selected records.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmMarkPaidOpen(false)}>Cancel</Button>
                <Button onClick={handleMarkAllPaid} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Confirm & Mark Paid
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
