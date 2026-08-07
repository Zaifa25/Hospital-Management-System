"use client"

import { useState, useEffect } from "react"
import { Stethoscope, Plus, Search, FileSpreadsheet, Clock, CheckCircle2, FlaskConical, ChevronRight, Edit, X } from "lucide-react"
import { apiUrl } from "@/lib/env"
import { usePatients } from "@/hooks/use-patients"
import { useDoctors } from "@/hooks/use-doctors"

export default function LabPage() {
  const [labTests, setLabTests] = useState<any[]>([])
  const [labOrders, setLabOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showResultModal, setShowResultModal] = useState<any | null>(null)
  const [filterStatus, setFilterStatus] = useState("All")

  const { patients } = usePatients()
  const { doctors } = useDoctors()

  const [patientId, setPatientId] = useState("")
  const [doctorId, setDoctorId] = useState("")
  const [testId, setTestId] = useState("")

  const [resultSummary, setResultSummary] = useState("")
  const [sampleStatus, setSampleStatus] = useState("Collected")
  const [status, setStatus] = useState("Completed")

  const getToken = () => localStorage.getItem("hms_jwt") || localStorage.getItem("token") || ""

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const headers = { Authorization: `Bearer ${token}` }
      const [resTests, resOrders] = await Promise.all([
        fetch(apiUrl("/lab/tests"), { headers }),
        fetch(apiUrl("/lab/orders"), { headers }),
      ])
      if (resTests.ok) setLabTests(await resTests.json())
      if (resOrders.ok) setLabOrders(await resOrders.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleOrderLabTest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = getToken()
      const res = await fetch(apiUrl("/lab/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientId: Number(patientId), doctorId: Number(doctorId), testId: Number(testId) }),
      })
      if (res.ok) {
        alert("Lab test ordered successfully!")
        setPatientId(""); setDoctorId(""); setTestId("")
        setShowOrderForm(false)
        fetchData()
      } else {
        const err = await res.json()
        alert(err.message || "Failed to place lab order")
      }
    } catch (err) { console.error(err) }
  }

  const handleUpdateResult = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showResultModal) return
    try {
      const token = getToken()
      const res = await fetch(apiUrl(`/lab/orders/${showResultModal.id}/result`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sampleStatus, resultSummary, status }),
      })
      if (res.ok) {
        alert("Lab result updated successfully!")
        setShowResultModal(null)
        fetchData()
      } else {
        const err = await res.json()
        alert(err.message || "Failed to update result")
      }
    } catch (err) { console.error(err) }
  }

  const filteredOrders = labOrders.filter((o) => filterStatus === "All" || o.status === filterStatus)

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      Ordered: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30",
      "In Progress": "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30",
      Completed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30",
    }
    return map[s] || "bg-muted text-muted-foreground border"
  }

  const sampleBadge = (s: string) => {
    const map: Record<string, string> = {
      Pending: "bg-slate-100 text-slate-600 border-slate-200",
      Collected: "bg-purple-100 text-purple-700 border-purple-200",
      Processing: "bg-amber-100 text-amber-700 border-amber-200",
      Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    }
    return map[s] || "bg-muted text-muted-foreground border"
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Order Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" /> Order Diagnostic Test
              </h2>
              <button onClick={() => setShowOrderForm(false)} className="p-2 rounded-full hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleOrderLabTest} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Select Patient *</label>
                <select required value={patientId} onChange={(e) => setPatientId(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-xl bg-background text-sm font-medium">
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Ordering Doctor *</label>
                <select required value={doctorId} onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-xl bg-background text-sm font-medium">
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Select Lab Test *</label>
                <select required value={testId} onChange={(e) => setTestId(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-xl bg-background text-sm font-medium">
                  <option value="">-- Select Test --</option>
                  {labTests.map((t) => (
                    <option key={t.id} value={t.id}>[{t.testCode}] {t.testName} — ₨{t.price}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowOrderForm(false)}
                  className="flex-1 border py-2.5 rounded-xl font-semibold text-sm hover:bg-muted">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-bold text-sm hover:opacity-90">
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Enter Lab Result</h2>
              <button onClick={() => setShowResultModal(null)} className="p-2 rounded-full hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-1">
              <p><span className="text-muted-foreground text-xs font-semibold">PATIENT</span><br /><span className="font-bold">{showResultModal.patient?.fullName}</span> ({showResultModal.patient?.mrNo})</p>
              <p><span className="text-muted-foreground text-xs font-semibold">TEST</span><br /><span className="font-bold">{showResultModal.test?.testName}</span></p>
              {showResultModal.test?.referenceRange && (
                <p><span className="text-muted-foreground text-xs font-semibold">REFERENCE RANGE</span><br /><span className="font-mono text-xs">{showResultModal.test.referenceRange}</span></p>
              )}
            </div>

            <form onSubmit={handleUpdateResult} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Sample Status</label>
                <select value={sampleStatus} onChange={(e) => setSampleStatus(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-xl bg-background text-sm">
                  {["Pending","Collected","Processing","Completed"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Result Summary / Findings</label>
                <textarea value={resultSummary} onChange={(e) => setResultSummary(e.target.value)}
                  placeholder="Enter lab findings, values and interpretation..."
                  rows={3}
                  className="w-full mt-1 p-2.5 border rounded-xl bg-background text-sm resize-none" />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Order Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-xl bg-background text-sm">
                  <option value="Ordered">Ordered</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowResultModal(null)}
                  className="flex-1 border py-2.5 rounded-xl font-semibold text-sm hover:bg-muted">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-bold text-sm hover:opacity-90">
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" /> Laboratory Information System (LIS)
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Order & track pathology, radiology tests, record results, and manage sample workflows.
          </p>
        </div>
        <button onClick={() => setShowOrderForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 shadow">
          <Plus className="h-4 w-4" /> New Lab Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: labOrders.length, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200" },
          { label: "Pending", value: labOrders.filter(o => o.status === "Ordered").length, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200" },
          { label: "In Progress", value: labOrders.filter(o => o.status === "In Progress").length, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/30 border-purple-200" },
          { label: "Completed", value: labOrders.filter(o => o.status === "Completed").length, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200" },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.bg}`}>
            <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" /> Lab Orders & Workflow
          </h2>
          <div className="flex gap-2">
            {["All", "Ordered", "In Progress", "Completed"].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-accent text-muted-foreground"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading lab orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No orders in this category.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground font-bold uppercase tracking-wide border-b">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Test</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Sample</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Result</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-muted-foreground">#LAB-{String(o.id).padStart(4, "0")}</td>
                    <td className="p-4">
                      <div className="font-semibold">{o.patient?.fullName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{o.patient?.mrNo}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">{o.test?.testName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{o.test?.testCode}</div>
                    </td>
                    <td className="p-4 text-xs">Dr. {o.doctor?.name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${sampleBadge(o.sampleStatus)}`}>
                        {o.sampleStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground max-w-[160px] truncate">
                      {o.resultSummary || <span className="italic text-muted-foreground">Pending</span>}
                    </td>
                    <td className="p-4">
                      {o.status !== "Completed" && (
                        <button
                          onClick={() => {
                            setShowResultModal(o)
                            setSampleStatus(o.sampleStatus)
                            setResultSummary(o.resultSummary || "")
                            setStatus(o.status)
                          }}
                          className="flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all"
                        >
                          <Edit className="h-3.5 w-3.5" /> Enter Result
                        </button>
                      )}
                      {o.status === "Completed" && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                          <CheckCircle2 className="h-4 w-4" /> Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
