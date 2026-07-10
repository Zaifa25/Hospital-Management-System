import { useEffect, useState } from "react"
import axios from "axios"

export type Period = "daily" | "weekly" | "monthly" | "yearly"

export type AnalyticsData = {
  appointmentsTrend: { label: string; count: number }[]
  paymentsTrend: { label: string; revenue: number; expenses: number }[]
  appointmentsByDepartment: { name: string; count: number }[]
  paymentsMethods: { method: string; count: number }[]
  totalRevenue: number
  totalExpenses: number
  totalAppointments: number
}

function getDateRange(period: Period): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  let start = new Date(now)

  switch (period) {
    case "daily":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case "weekly":
      const dayOfWeek = now.getDay()
      start = new Date(now)
      start.setDate(now.getDate() - dayOfWeek)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case "monthly":
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case "yearly":
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
  }

  return { start, end }
}

function buildTrend(
  payments: any[],
  period: Period,
  start: Date,
  end: Date
): { label: string; revenue: number; expenses: number }[] {
  switch (period) {
    case "daily": {
      // Group by hour 0-23
      const hourMap: Record<number, { revenue: number; expenses: number }> = {}
      payments.forEach((p) => {
        const d = new Date(p.date)
        if (d >= start && d <= end) {
          const h = d.getHours()
          if (!hourMap[h]) hourMap[h] = { revenue: 0, expenses: 0 }
          hourMap[h].revenue += Number(p.paid) || 0
          hourMap[h].expenses += Number(p.netTotal) * 0.3 || 0
        }
      })
      return Array.from({ length: 24 }, (_, h) => ({
        label: `${h}:00`,
        revenue: Math.round((hourMap[h]?.revenue || 0)),
        expenses: Math.round((hourMap[h]?.expenses || 0)),
      }))
    }
    case "weekly": {
      // Group by day Sun-Sat
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const dayMap: Record<number, { revenue: number; expenses: number }> = {}
      payments.forEach((p) => {
        const d = new Date(p.date)
        if (d >= start && d <= end) {
          const day = d.getDay()
          if (!dayMap[day]) dayMap[day] = { revenue: 0, expenses: 0 }
          dayMap[day].revenue += Number(p.paid) || 0
          dayMap[day].expenses += Number(p.netTotal) * 0.3 || 0
        }
      })
      return dayNames.map((name, i) => ({
        label: name,
        revenue: Math.round(dayMap[i]?.revenue || 0),
        expenses: Math.round(dayMap[i]?.expenses || 0),
      }))
    }
    case "monthly": {
      // Group by day-of-month
      const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
      const dayMap: Record<number, { revenue: number; expenses: number }> = {}
      payments.forEach((p) => {
        const d = new Date(p.date)
        if (d >= start && d <= end) {
          const day = d.getDate()
          if (!dayMap[day]) dayMap[day] = { revenue: 0, expenses: 0 }
          dayMap[day].revenue += Number(p.paid) || 0
          dayMap[day].expenses += Number(p.netTotal) * 0.3 || 0
        }
      })
      return Array.from({ length: daysInMonth }, (_, i) => ({
        label: String(i + 1),
        revenue: Math.round(dayMap[i + 1]?.revenue || 0),
        expenses: Math.round(dayMap[i + 1]?.expenses || 0),
      }))
    }
    case "yearly": {
      // Group by month Jan-Dec
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const monthMap: Record<number, { revenue: number; expenses: number }> = {}
      payments.forEach((p) => {
        const d = new Date(p.date)
        if (d >= start && d <= end) {
          const m = d.getMonth()
          if (!monthMap[m]) monthMap[m] = { revenue: 0, expenses: 0 }
          monthMap[m].revenue += Number(p.paid) || 0
          monthMap[m].expenses += Number(p.netTotal) * 0.3 || 0
        }
      })
      return monthNames.map((name, i) => ({
        label: name,
        revenue: Math.round(monthMap[i]?.revenue || 0),
        expenses: Math.round(monthMap[i]?.expenses || 0),
      }))
    }
  }
}

function buildAppointmentsTrend(
  appointments: any[],
  period: Period,
  start: Date,
  end: Date
): { label: string; count: number }[] {
  switch (period) {
    case "daily": {
      const hourMap: Record<number, number> = {}
      appointments.forEach((a) => {
        const d = new Date(a.date)
        if (d >= start && d <= end) {
          const h = d.getHours()
          hourMap[h] = (hourMap[h] || 0) + 1
        }
      })
      return Array.from({ length: 24 }, (_, h) => ({
        label: `${h}:00`,
        count: hourMap[h] || 0,
      }))
    }
    case "weekly": {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      const dayMap: Record<number, number> = {}
      appointments.forEach((a) => {
        const d = new Date(a.date)
        if (d >= start && d <= end) {
          const day = d.getDay()
          dayMap[day] = (dayMap[day] || 0) + 1
        }
      })
      return dayNames.map((name, i) => ({ label: name, count: dayMap[i] || 0 }))
    }
    case "monthly": {
      const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
      const dayMap: Record<number, number> = {}
      appointments.forEach((a) => {
        const d = new Date(a.date)
        if (d >= start && d <= end) {
          const day = d.getDate()
          dayMap[day] = (dayMap[day] || 0) + 1
        }
      })
      return Array.from({ length: daysInMonth }, (_, i) => ({
        label: String(i + 1),
        count: dayMap[i + 1] || 0,
      }))
    }
    case "yearly": {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      const monthMap: Record<number, number> = {}
      appointments.forEach((a) => {
        const d = new Date(a.date)
        if (d >= start && d <= end) {
          const m = d.getMonth()
          monthMap[m] = (monthMap[m] || 0) + 1
        }
      })
      return monthNames.map((name, i) => ({ label: name, count: monthMap[i] || 0 }))
    }
  }
}

export function useAnalyticsData(period: Period = "monthly") {
  const [data, setData] = useState<AnalyticsData>({
    appointmentsTrend: [],
    paymentsTrend: [],
    appointmentsByDepartment: [],
    paymentsMethods: [],
    totalRevenue: 0,
    totalExpenses: 0,
    totalAppointments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Raw data stored separately so re-filtering doesn't require re-fetching
  const [rawPayments, setRawPayments] = useState<any[]>([])
  const [rawAppointments, setRawAppointments] = useState<any[]>([])
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    async function fetchAll() {
      try {
        const token = localStorage.getItem("hms_jwt")
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        const [appointmentsRes, paymentsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/appointments", { headers }),
          axios.get("http://localhost:5000/api/payments", { headers }),
        ])
        const normalize = (res: any) => (Array.isArray(res) ? res : res?.data || res?.items || [])
        setRawPayments(normalize(paymentsRes.data))
        setRawAppointments(normalize(appointmentsRes.data))
        setHasFetched(true)
      } catch (err) {
        console.error("Error fetching analytics:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch analytics")
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  useEffect(() => {
    if (!hasFetched) return
    setLoading(true)

    const { start, end } = getDateRange(period)

    // Filter by period
    const filteredPayments = rawPayments.filter((p) => {
      const d = new Date(p.date)
      return d >= start && d <= end
    })
    const filteredAppointments = rawAppointments.filter((a) => {
      const d = new Date(a.date)
      return d >= start && d <= end
    })

    // Revenue & expenses
    const totalRevenue = filteredPayments.reduce((sum, p) => sum + (Number(p.paid) || 0), 0)
    const totalExpenses = filteredPayments.reduce((sum, p) => sum + (Number(p.netTotal) * 0.3 || 0), 0)
    const totalAppointments = filteredAppointments.length

    // Trend charts
    const paymentsTrend = buildTrend(rawPayments, period, start, end)
    const appointmentsTrend = buildAppointmentsTrend(rawAppointments, period, start, end)

    // Appointments by department (all time or period-filtered)
    const deptMap: Record<string, number> = {}
    filteredAppointments.forEach((a: any) => {
      const deptName = a.department?.name || a.department || `Dept ${a.departmentId}`
      deptMap[deptName] = (deptMap[deptName] || 0) + 1
    })
    const appointmentsByDepartment = Object.entries(deptMap).map(([name, count]) => ({ name, count }))

    // Payment methods (period-filtered)
    const methodMap: Record<string, number> = {}
    filteredPayments.forEach((p: any) => {
      const method = p.method || "unknown"
      methodMap[method] = (methodMap[method] || 0) + 1
    })
    const paymentsMethods = Object.entries(methodMap).map(([method, count]) => ({
      method: method.charAt(0).toUpperCase() + method.slice(1),
      count,
    }))

    setData({
      appointmentsTrend,
      paymentsTrend,
      appointmentsByDepartment,
      paymentsMethods,
      totalRevenue,
      totalExpenses: Math.round(totalExpenses),
      totalAppointments,
    })
    setLoading(false)
  }, [period, hasFetched, rawPayments, rawAppointments])

  return { data, loading, error }
}
