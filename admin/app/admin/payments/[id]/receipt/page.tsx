"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Printer, CheckCircle, Clock, XCircle } from "lucide-react"

function Row({ label, value, bold }: { label: string; value: string | number; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-dashed border-gray-200 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm ${bold ? "font-bold text-gray-900" : "text-gray-700"}`}>{value}</span>
    </div>
  )
}

const statusIcon: Record<string, React.ReactNode> = {
  paid: <CheckCircle className="h-4 w-4 text-emerald-600" />,
  pending: <Clock className="h-4 w-4 text-amber-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
}

const statusColor: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
}

export default function PaymentReceiptPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [payment, setPayment] = useState<any>(null)
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("hms_jwt")
        const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        const base = "http://localhost:5000/api"

        const payRes = await axios.get(`${base}/payments/${id}`, { headers })
        const p = payRes.data
        setPayment(p)

        if (p?.patientId) {
          const patRes = await axios.get(`${base}/patients/${p.patientId}`, { headers })
          setPatient(patRes.data)
        }
      } catch (err) {
        console.error("Failed to load receipt:", err)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const balance =
    payment
      ? (Number(payment.netTotal) || 0) +
        (Number(payment.xrayCharge) || 0) +
        (Number(payment.preBalance) || 0) -
        (Number(payment.paid) || 0) -
        (Number(payment.xrayPaid) || 0)
      : 0

  const fmt = (n: number) =>
    `₨ ${n.toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <>
      {/* Print-mode: hide everything outside #receipt */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #receipt-root { display: block !important; }
          #receipt-root .no-print { display: none !important; }
          #receipt-root #receipt {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div id="receipt-root" className="space-y-4">
        {/* Toolbar — hidden when printing */}
        <div className="no-print flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 ml-auto"
            disabled={loading}
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>
        </div>

        {/* Receipt Card */}
        <div
          id="receipt"
          className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {/* Header strip */}
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold tracking-tight">Hospital Management</h1>
                <p className="text-xs opacity-80 mt-0.5">Payment Receipt</p>
              </div>
              <div className="text-right">
                {loading ? (
                  <Skeleton className="h-5 w-20 bg-white/20" />
                ) : (
                  <>
                    <p className="text-xs opacity-70">Receipt #</p>
                    <p className="font-bold text-lg">{payment?.id ?? "—"}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            ) : (
              <>
                {/* Date + Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {payment?.date
                        ? new Date(payment.date).toLocaleDateString("en-PK", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {payment?.date
                        ? new Date(payment.date).toLocaleTimeString("en-PK", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                      statusColor[payment?.status] ?? "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {statusIcon[payment?.status]}
                    {payment?.status ?? "—"}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed" />

                {/* Patient Info */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Patient
                  </p>
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Full Name</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {patient?.fullName ?? "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">MR Number</span>
                      <span className="text-sm font-mono text-gray-700">
                        {payment?.mrNo ?? patient?.mrNo ?? "—"}
                      </span>
                    </div>
                    {patient?.phone && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Phone</span>
                        <span className="text-sm text-gray-700">{patient.phone}</span>
                      </div>
                    )}
                    {patient?.address && (
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-400">Address</span>
                        <span className="text-sm text-gray-700 text-right max-w-[55%]">
                          {patient.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed" />

                {/* Payment Details */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Payment Details
                  </p>
                  <div className="space-y-0.5">
                    <Row label="Payment Method" value={(payment?.method ?? "—").toUpperCase()} />
                    {Number(payment?.preBalance) > 0 && (
                      <Row label="Previous Balance" value={fmt(Number(payment.preBalance))} />
                    )}
                    <Row label="Net Total" value={fmt(Number(payment?.netTotal ?? 0))} />
                    {Number(payment?.xrayCharge) > 0 && (
                      <Row label="X-Ray Charge" value={fmt(Number(payment.xrayCharge))} />
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t" />

                {/* Payment Made */}
                <div className="space-y-0.5">
                  <Row label="Amount Paid" value={fmt(Number(payment?.paid ?? 0))} bold />
                  {Number(payment?.xrayPaid) > 0 && (
                    <Row label="X-Ray Paid" value={fmt(Number(payment.xrayPaid))} bold />
                  )}
                </div>

                {/* Balance Banner */}
                <div
                  className={`rounded-xl p-4 text-center ${
                    balance > 0
                      ? "bg-amber-50 border border-amber-200"
                      : "bg-emerald-50 border border-emerald-200"
                  }`}
                >
                  <p className="text-xs text-gray-500 mb-1">Outstanding Balance</p>
                  <p
                    className={`text-2xl font-extrabold ${
                      balance > 0 ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {fmt(balance)}
                  </p>
                  {balance <= 0 && (
                    <p className="text-xs text-emerald-600 mt-1 font-medium">✓ Fully Paid</p>
                  )}
                </div>

                {/* Footer */}
                <div className="text-center pt-2">
                  <p className="text-[10px] text-gray-300">
                    This is a computer-generated receipt. No signature required.
                  </p>
                  <p className="text-[10px] text-gray-300 mt-0.5">
                    Generated:{" "}
                    {new Date().toLocaleDateString("en-PK", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
