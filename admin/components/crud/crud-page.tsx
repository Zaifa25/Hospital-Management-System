"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DataTable } from "./data-table"
import { EntityForm } from "./entity-form"
import { useState, useMemo } from "react"
import axios from "axios"
import { toast } from "@/hooks/use-toast"
import { fetchJSON, mutateWithAuth } from "@/lib/api-client"
import type { EntityConfig } from "@/lib/entities"
import { useRouter } from "next/navigation"
import { apiUrl } from "@/lib/env"
import { DailyAttendanceSheet } from "@/components/attendance/daily-attendance-sheet"
import { SalarySlipModal } from "@/components/payroll/salary-slip-modal"
import { MonthlyPayrollSheet } from "@/components/payroll/monthly-payroll-sheet"
import { UserCheck, DollarSign, CheckCircle2, Clock, Sparkles, Receipt } from "lucide-react"

export function CRUDPage({ config }: { config: EntityConfig }) {
  const [query, setQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [monthFilter, setMonthFilter] = useState<string>("All")
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
    }
  }

  const { data, isLoading, mutate } = useSWR<{ items: any[]; total: number }>(swrKey, fetcher, {
    refreshInterval: 10000,
  })

  const rawItems = useMemo(() => data?.items ?? [], [data])

  const filteredItems = useMemo(() => {
    let result = rawItems

    if (config.key === "payroll" && monthFilter && monthFilter !== "All") {
      result = result.filter((item: any) => item.month === monthFilter)
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
  }, [rawItems, query, dateFilter, monthFilter, config.key])

  const total = filteredItems.length

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredItems.slice(start, start + pageSize)
  }, [filteredItems, page, pageSize])

  const payrollStats = useMemo(() => {
    if (config.key !== "payroll") return null
    let totalNet = 0
    let paidNet = 0
    let pendingNet = 0
    let paidCount = 0
    let pendingCount = 0

    filteredItems.forEach((item: any) => {
      const net = Number(item.netSalary) || 0
      totalNet += net
      if (item.status === "Paid") {
        paidNet += net
        paidCount++
      } else {
        pendingNet += net
        pendingCount++
      }
    })

    return { totalNet, paidNet, pendingNet, paidCount, pendingCount }
  }, [config.key, filteredItems])

  const handleMarkPaid = async (row: any) => {
    try {
      const token = localStorage.getItem("hms_jwt")
      await axios.put(apiUrl(`/payrolls/${row.id}/pay`), {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      toast({
        title: "Salary Marked as Paid!",
        description: `Successfully marked payout for ${row.employee?.name || `Employee #${row.employeeId}`}`,
      })
      mutate()
    } catch (err: any) {
      toast({
        title: "Failed to mark salary as paid",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      })
    }
  }

  const handleGenerateMonthlyPayroll = async () => {
    const currentMonth = "July 2026"
    setGeneratingPayroll(true)
    try {
      const token = localStorage.getItem("hms_jwt")
      const res = await axios.post(
        apiUrl("/payrolls/generate"),
        { month: currentMonth },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      toast({
        title: "Monthly Payroll Generated",
        description: res.data.message || `Generated payroll entries for ${currentMonth}`,
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
    const currentMonth = "July 2026"
    try {
      const token = localStorage.getItem("hms_jwt")
      const res = await axios.post(
        apiUrl("/payrolls/mark-all-paid"),
        { month: currentMonth },
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
          <h1 className="text-2xl font-semibold">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.description}</p>
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
                onClick={handleGenerateMonthlyPayroll}
                disabled={generatingPayroll}
              >
                <Sparkles className="h-4 w-4 text-emerald-600" />
                {generatingPayroll ? "Generating..." : "Auto-Generate Monthly Sheet"}
              </Button>
              <Button
                variant="outline"
                className="gap-2 shadow-sm"
                onClick={handleMarkAllPaid}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Mark All Month Paid
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-emerald-500/10 border-emerald-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Total Payroll Expense</p>
                <p className="text-xl font-bold text-emerald-900 mt-1">₨ {payrollStats.totalNet.toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Total Paid Out</p>
                <p className="text-xl font-bold text-blue-900 mt-1">₨ {payrollStats.paidNet.toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-500/10 border-amber-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Total Pending</p>
                <p className="text-xl font-bold text-amber-900 mt-1">₨ {payrollStats.pendingNet.toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-amber-600 text-white rounded-xl">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-500/10 border-purple-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Staff Payout Progress</p>
                <p className="text-xl font-bold text-purple-900 mt-1">
                  {payrollStats.paidCount} / {payrollStats.paidCount + payrollStats.pendingCount} Paid
                </p>
              </div>
              <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                <Receipt className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between flex-wrap">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder={`Search ${config.title.toLowerCase()}...`}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              className="max-w-xs"
            />

            {/* Month Filter Dropdown for Payroll */}
            {config.key === "payroll" ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Filter Month:</span>
                <select
                  value={monthFilter}
                  onChange={(e) => {
                    setMonthFilter(e.target.value)
                    setPage(1)
                  }}
                  className="h-9 rounded-md border bg-background px-3 py-1 text-sm font-medium shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="All">All Months</option>
                  {[
                    "January 2026", "February 2026", "March 2026", "April 2026",
                    "May 2026", "June 2026", "July 2026", "August 2026",
                    "September 2026", "October 2026", "November 2026", "December 2026"
                  ].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {monthFilter !== "All" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMonthFilter("All")
                      setPage(1)
                    }}
                    className="text-xs h-9 px-2 text-muted-foreground hover:text-foreground"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            ) : (
              /* Date Filter Input */
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Filter Date:</span>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value)
                    setPage(1)
                  }}
                  className="w-40 h-9 text-sm"
                />
                {dateFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateFilter("")
                      setPage(1)
                    }}
                    className="text-xs h-9 px-2 text-muted-foreground hover:text-foreground"
                  >
                    Clear Date
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground" htmlFor="pageSize">
              Rows
            </label>
            <select
              id="pageSize"
              className="rounded-md border bg-background px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
              }}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

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
        </>
      )}
    </div>
  )
}
