import { useEffect, useState } from "react"
import axios from "axios"

export type DashboardStats = {
  totalAppointments: number
  totalPatients: number
  totalDoctors: number
  totalPayments: number
  totalDepartments: number
  totalProcedures: number
  totalDSAs: number
  recentAppointments: any[]
  recentPayments: any[]
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalPayments: 0,
    totalDepartments: 0,
    totalProcedures: 0,
    totalDSAs: 0,
    recentAppointments: [],
    recentPayments: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("hms_jwt")
        const headers = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }

        const [patientsRes, appointmentsRes, doctorsRes, paymentsRes, deptsRes, procsRes, dsasRes] = await Promise.all([
          axios.get("http://localhost:5000/api/patients", { headers }),
          axios.get("http://localhost:5000/api/appointments", { headers }),
          axios.get("http://localhost:5000/api/doctors", { headers }),
          axios.get("http://localhost:5000/api/payments", { headers }),
          axios.get("http://localhost:5000/api/departments", { headers }),
          axios.get("http://localhost:5000/api/procedures", { headers }),
          axios.get("http://localhost:5000/api/dsas", { headers }),
        ])

        // Normalize response shapes
        const normalize = (res: any) => Array.isArray(res) ? res : res?.data || res?.items || []

        const patients = normalize(patientsRes.data)
        const appointments = normalize(appointmentsRes.data)
        const doctors = normalize(doctorsRes.data)
        const payments = normalize(paymentsRes.data)
        const departments = normalize(deptsRes.data)
        const procedures = normalize(procsRes.data)
        const dsas = normalize(dsasRes.data)

        // Create lookup maps for relationships
        const patientMap = new Map(patients.map((p: any) => [p.id, p]))
        const doctorMap = new Map(doctors.map((d: any) => [d.id, d]))
        const deptMap = new Map(departments.map((d: any) => [d.id, d]))

        // Enrich recent appointments with relationship data
        const enrichedAppointments = appointments.slice(0, 5).map((a: any) => ({
          ...a,
          patientName: (patientMap.get(a.patientId) as any)?.fullName || `Patient ${a.patientId}`,
          doctorName: (doctorMap.get(a.doctorId) as any)?.name || `Doctor ${a.doctorId}`,
          departmentName: (deptMap.get(a.departmentId) as any)?.name || `Department ${a.departmentId}`,
        }))

        // Enrich recent payments with patient data
        const enrichedPayments = payments.slice(0, 5).map((p: any) => ({
          ...p,
          patientName: (patientMap.get(p.patientId) as any)?.fullName || `Patient ${p.patientId}`,
        }))

        setStats({
          totalPatients: patients.length,
          totalAppointments: appointments.length,
          totalDoctors: doctors.length,
          totalPayments: payments.length,
          totalDepartments: departments.length,
          totalProcedures: procedures.length,
          totalDSAs: dsas.length,
          recentAppointments: enrichedAppointments,
          recentPayments: enrichedPayments,
        })
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch stats")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}
