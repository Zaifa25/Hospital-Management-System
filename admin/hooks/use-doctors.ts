import { useEffect, useState } from "react"
import axios from "axios"

export type DoctorOption = {
  label: string
  value: number | string
  [key: string]: any
}

export function useDoctors() {
  const [doctors, setDoctors] = useState<DoctorOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchDoctors() {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("hms_jwt")
        const res = await axios.get("http://localhost:5000/api/doctors", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        let data = res.data
        if (!Array.isArray(data)) {
          data = data?.items ?? data?.data ?? data?.rows ?? data?.result ?? data
        }
        const options = (Array.isArray(data) ? data : []).map((d) => ({
          label: d.name || d.fullName || d.full_name || `Dr. ${d.id ?? d._id}`,
          value: d.id ?? d._id,
          doctor: d,
        }))
        if (!cancelled) setDoctors(options)
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to fetch doctors")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchDoctors()
    return () => { cancelled = true }
  }, [])

  return { doctors, loading, error }
}
