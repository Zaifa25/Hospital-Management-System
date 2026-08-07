"use client"

import { useState, useEffect } from "react"
import { Activity, Plus, FileText, HeartPulse, Stethoscope, User, Printer, Trash2, CheckCircle, Search, Eye } from "lucide-react"
import { apiUrl } from "@/lib/env"
import { usePatients } from "@/hooks/use-patients"
import { useDoctors } from "@/hooks/use-doctors"

export default function EHRPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"prescriptions" | "vitals">("prescriptions")
  const [selectedRxForPrint, setSelectedRxForPrint] = useState<any | null>(null)

  const { patients } = usePatients()
  const { doctors } = useDoctors()

  // Prescription Form
  const [patientId, setPatientId] = useState("")
  const [doctorId, setDoctorId] = useState("")
  const [items, setItems] = useState<Array<{ medicineName: string; dosage: string; frequency: string; duration: string; instructions: string }>>([
    { medicineName: "", dosage: "", frequency: "1-0-1 (Twice Daily)", duration: "5 days", instructions: "Take after meals" },
  ])

  // Vitals Form
  const [vitalsPatientId, setVitalsPatientId] = useState("")
  const [bpSystolic, setBpSystolic] = useState("")
  const [bpDiastolic, setBpDiastolic] = useState("")
  const [pulse, setPulse] = useState("")
  const [temperature, setTemperature] = useState("")
  const [spo2, setSpo2] = useState("")
  const [weight, setWeight] = useState("")

  const getToken = () => localStorage.getItem("hms_jwt") || localStorage.getItem("token") || ""

  const fetchPrescriptions = async () => {
    try {
      const token = getToken()
      const res = await fetch(apiUrl("/ehr/prescriptions"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setPrescriptions(await res.json())
    } catch (err) {
      console.error("Error fetching EHR data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const addItemRow = () => {
    setItems([...items, { medicineName: "", dosage: "", frequency: "1-0-1 (Twice Daily)", duration: "5 days", instructions: "Take after meals" }])
  }

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId || !doctorId) {
      alert("Please select both a Patient and a Doctor.")
      return
    }

    try {
      const token = getToken()
      const res = await fetch(apiUrl("/ehr/prescriptions"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: Number(patientId),
          doctorId: Number(doctorId),
          items,
        }),
      })

      if (res.ok) {
        alert("Digital Prescription issued successfully!")
        setItems([{ medicineName: "", dosage: "", frequency: "1-0-1 (Twice Daily)", duration: "5 days", instructions: "Take after meals" }])
        fetchPrescriptions()
      } else {
        const err = await res.json()
        alert(err.message || "Failed to issue prescription")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleRecordVitals = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vitalsPatientId) {
      alert("Please select a Patient.")
      return
    }

    try {
      const token = getToken()
      const res = await fetch(apiUrl("/ehr/vitals"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: Number(vitalsPatientId),
          bpSystolic: bpSystolic ? Number(bpSystolic) : null,
          bpDiastolic: bpDiastolic ? Number(bpDiastolic) : null,
          pulse: pulse ? Number(pulse) : null,
          temperature: temperature ? Number(temperature) : null,
          spo2: spo2 ? Number(spo2) : null,
          weight: weight ? Number(weight) : null,
        }),
      })

      if (res.ok) {
        alert("Vital signs logged into EHR successfully!")
        setBpSystolic("")
        setBpDiastolic("")
        setPulse("")
        setTemperature("")
        setSpo2("")
        setWeight("")
      } else {
        const err = await res.json()
        alert(err.message || "Failed to record vitals")
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Printable Prescription Modal */}
      {selectedRxForPrint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 space-y-6 border print:p-0">
            {/* Prescription Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-2xl font-black text-blue-700 tracking-tight">CITY CARE HOSPITAL</h2>
                <p className="text-xs text-slate-500">Advanced Medical & Diagnostic Center</p>
                <p className="text-xs text-slate-500">Tel: +92 51 111-222-333 • Email: info@citycarehospital.com</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-blue-600 font-serif">Rx</span>
                <p className="text-xs text-slate-400 font-mono mt-1">Rx #{selectedRxForPrint.id}</p>
              </div>
            </div>

            {/* Meta details */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <p className="text-slate-400 font-medium">PATIENT DETAILS</p>
                <p className="font-bold text-slate-800 text-sm">{selectedRxForPrint.patient?.fullName}</p>
                <p className="text-slate-600">MR No: <span className="font-mono">{selectedRxForPrint.patient?.mrNo}</span></p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-medium">PRESCRIBING DOCTOR</p>
                <p className="font-bold text-slate-800 text-sm">Dr. {selectedRxForPrint.doctor?.name}</p>
                <p className="text-slate-600">{selectedRxForPrint.doctor?.qualification || "Consultant Physician"}</p>
                <p className="text-slate-400 mt-1">{new Date(selectedRxForPrint.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider">MEDICATIONS PRESCRIBED</h3>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b text-slate-500 font-semibold">
                    <th className="py-2">Medicine</th>
                    <th className="py-2">Dosage</th>
                    <th className="py-2">Frequency</th>
                    <th className="py-2">Duration</th>
                    <th className="py-2">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedRxForPrint.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-2.5 font-bold text-slate-800">{item.medicineName}</td>
                      <td className="py-2.5 text-slate-600">{item.dosage}</td>
                      <td className="py-2.5 text-slate-600">{item.frequency}</td>
                      <td className="py-2.5 text-slate-600">{item.duration}</td>
                      <td className="py-2.5 text-slate-500 italic">{item.instructions || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Signature */}
            <div className="flex justify-between items-end border-t pt-6 text-xs text-slate-500">
              <div>
                <p className="italic">Wish you a speedy recovery!</p>
              </div>
              <div className="text-center">
                <div className="border-b border-slate-400 w-40 mb-1" />
                <p className="font-semibold text-slate-700">Doctor Signature</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700"
              >
                <Printer className="h-4 w-4" /> Print Prescription
              </button>
              <button
                onClick={() => setSelectedRxForPrint(null)}
                className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Electronic Health Records (EHR) & Prescriptions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enterprise clinical EHRsuite: Live patient selection, multi-item prescriptions & vitals monitoring.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "prescriptions"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-accent text-foreground"
            }`}
          >
            Digital Prescriptions
          </button>
          <button
            onClick={() => setActiveTab("vitals")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === "vitals"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-accent text-foreground"
            }`}
          >
            Patient Vital Signs
          </button>
        </div>
      </div>

      {activeTab === "prescriptions" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Prescription Form */}
          <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Write Digital Prescription
            </h2>

            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Select Patient</label>
                <select
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-lg bg-background text-sm font-medium"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Select Doctor</label>
                <select
                  required
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full mt-1 p-2.5 border rounded-lg bg-background text-sm font-medium"
                >
                  <option value="">-- Choose Attending Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Items */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-primary uppercase">Prescribed Medicines</label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add Medicine
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="p-3 border rounded-xl bg-muted/20 space-y-2 relative">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="absolute top-2 right-2 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                        value={item.medicineName}
                        onChange={(e) => updateItem(idx, "medicineName", e.target.value)}
                        className="w-full p-2 border rounded-lg bg-background text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Dosage (500mg)"
                        value={item.dosage}
                        onChange={(e) => updateItem(idx, "dosage", e.target.value)}
                        className="w-full p-2 border rounded-lg bg-background text-xs"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Duration (5 days)"
                        value={item.duration}
                        onChange={(e) => updateItem(idx, "duration", e.target.value)}
                        className="w-full p-2 border rounded-lg bg-background text-xs"
                      />
                    </div>

                    <select
                      value={item.frequency}
                      onChange={(e) => updateItem(idx, "frequency", e.target.value)}
                      className="w-full p-2 border rounded-lg bg-background text-xs"
                    >
                      <option value="1-0-1 (Twice Daily)">1-0-1 (Twice Daily)</option>
                      <option value="1-1-1 (Thrice Daily)">1-1-1 (Thrice Daily)</option>
                      <option value="1-0-0 (Morning)">1-0-0 (Morning)</option>
                      <option value="0-0-1 (Night)">0-0-1 (Night)</option>
                      <option value="As Needed (PRN)">As Needed (PRN)</option>
                    </select>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-xl font-bold text-sm hover:opacity-90 shadow"
              >
                Sign & Issue Prescription
              </button>
            </form>
          </div>

          {/* Active Prescriptions List */}
          <div className="lg:col-span-2 bg-card p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Issued Prescriptions ({prescriptions.length})
            </h2>

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading clinical records...</p>
            ) : prescriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No prescriptions issued yet.</p>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="p-4 border rounded-xl bg-background/50 space-y-3 hover:border-primary/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-base text-foreground">
                          {rx.patient?.fullName}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          MR No: <span className="font-mono font-semibold">{rx.patient?.mrNo}</span> • Doctor: Dr. {rx.doctor?.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRxForPrint(rx)}
                          className="flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-lg font-semibold hover:bg-primary hover:text-white transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" /> View / Print
                        </button>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-3 rounded-lg divide-y text-xs">
                      {rx.items?.map((item: any) => (
                        <div key={item.id} className="py-1.5 flex justify-between">
                          <span className="font-semibold text-foreground">{item.medicineName}</span>
                          <span className="text-muted-foreground">
                            {item.dosage} • {item.frequency} • {item.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Vitals Form */
        <div className="bg-card p-6 rounded-xl border shadow-sm max-w-2xl mx-auto space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-rose-500" />
            Record Patient Vital Signs
          </h2>

          <form onSubmit={handleRecordVitals} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Select Patient</label>
              <select
                required
                value={vitalsPatientId}
                onChange={(e) => setVitalsPatientId(e.target.value)}
                className="w-full mt-1 p-2.5 border rounded-lg bg-background text-sm font-medium"
              >
                <option value="">-- Select Patient --</option>
                {patients.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">BP Systolic (mmHg)</label>
                <input
                  type="number"
                  placeholder="120"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg bg-background text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">BP Diastolic (mmHg)</label>
                <input
                  type="number"
                  placeholder="80"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg bg-background text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Pulse (BPM)</label>
                <input
                  type="number"
                  placeholder="72"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg bg-background text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="98.6"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg bg-background text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">SpO2 (%)</label>
                <input
                  type="number"
                  placeholder="98"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-lg bg-background text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2.5 px-4 rounded-xl font-bold text-sm hover:opacity-90 shadow"
            >
              Log Vital Signs into EHR
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
