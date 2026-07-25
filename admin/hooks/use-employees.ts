import { useEffect, useState } from "react"
import axios from "axios"
import { apiUrl } from "@/lib/env"

export type EmployeeOption = {
  label: string
  value: number | string
  employee: any
}

export function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchEmployees() {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("hms_jwt")
        const res = await axios.get(apiUrl("/employees"), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        let data = res.data
        if (!Array.isArray(data)) {
          data = data?.items ?? data?.data ?? data?.rows ?? data
        }
        const options = (Array.isArray(data) ? data : []).map((e: any) => ({
          label: `${e.name} (${e.designation || e.type})`,
          value: e.id,
          employee: e,
        }))
        if (!cancelled) setEmployees(options)
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to fetch employees")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchEmployees()
    return () => {
      cancelled = true
    }
  }, [])

  return { employees, loading, error }
}
