import { useEffect, useState } from "react"
import axios from "axios"

export type PatientOption = {
  label: string
  value: number | string
  mrNo?: string
  [key: string]: any
}

export function usePatients() {
  const [patients, setPatients] = useState<PatientOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchPatients() {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem("hms_jwt")
        const res = await axios.get("http://localhost:5000/api/patients", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        let data = res.data
        if (!Array.isArray(data)) {
          data = data?.items ?? data?.data ?? data?.rows ?? data?.result ?? data
        }
        const options = (Array.isArray(data) ? data : []).map((p) => ({
          label: p.fullName || p.full_name || p.name || `${p.mrNo || p.mr_no || ''} - ${p.fullName || p.full_name || p.name || ''}`,
          value: p.id ?? p._id,
          mrNo: p.mrNo ?? p.mr_no ?? p.MR ?? p.mrn ?? "",
          patient: p,
        }))
        if (!cancelled) setPatients(options)
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to fetch patients")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchPatients()
    return () => { cancelled = true }
  }, [])

  return { patients, loading, error }
}
