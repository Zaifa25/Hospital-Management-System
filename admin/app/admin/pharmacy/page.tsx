"use client"

import { useState, useEffect } from "react"
import { Pill, Plus, Search, PackageCheck, AlertTriangle, Edit, Trash2, X, TrendingDown } from "lucide-react"
import { apiUrl } from "@/lib/env"

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState("")
  const [genericName, setGenericName] = useState("")
  const [category, setCategory] = useState("Tablet")
  const [batchNo, setBatchNo] = useState("")
  const [stockQuantity, setStockQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [expiryDate, setExpiryDate] = useState("")

  const getToken = () => localStorage.getItem("hms_jwt") || localStorage.getItem("token") || ""

  const fetchMedicines = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const res = await fetch(apiUrl("/pharmacy/medicines"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setMedicines(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicines()
  }, [])

  const resetForm = () => {
    setName(""); setGenericName(""); setCategory("Tablet")
    setBatchNo(""); setStockQuantity(""); setUnitPrice(""); setExpiryDate("")
    setShowForm(false)
  }

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = getToken()
      const res = await fetch(apiUrl("/pharmacy/medicines"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, genericName, category, batchNo, stockQuantity, unitPrice, expiryDate }),
      })
      if (res.ok) {
        alert("Medicine batch added to inventory!")
        resetForm()
        fetchMedicines()
      } else {
        const err = await res.json()
        alert(err.message || "Failed to add medicine")
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.genericName && m.genericName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalValue = medicines.reduce((sum, m) => sum + m.unitPrice * m.stockQuantity, 0)
  const lowStock = medicines.filter((m) => m.stockQuantity > 0 && m.stockQuantity <= 20).length
  const outOfStock = medicines.filter((m) => m.stockQuantity === 0).length
  const nearExpiry = medicines.filter((m) => {
    const expDate = new Date(m.expiryDate)
    const diff = (expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    return diff < 90 && diff > 0
  }).length

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Add Medicine Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" /> Add New Medicine Batch
              </h2>
              <button onClick={resetForm} className="p-2 rounded-full hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Brand / Medicine Name *</label>
                  <input type="text" required placeholder="e.g. Augmentin 625mg" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 p-2.5 border rounded-xl bg-background text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Generic Name</label>
                  <input type="text" placeholder="e.g. Amoxicillin / Clavulanate" value={genericName} onChange={(e) => setGenericName(e.target.value)}
                    className="w-full mt-1 p-2.5 border rounded-xl bg-background text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 p-2.5 border rounded-xl bg-background text-sm">
                    {["Tablet","Capsule","Syrup","Injection","Ointment","Drops","Inhaler","Sachet"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Batch Number *</label>
                  <input type="text" required placeholder="BATCH-2026-01" value={batchNo} onChange={(e) => setBatchNo(e.target.value)}
                    className="w-full mt-1 p-2.5 border rounded-xl bg-background text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Stock Quantity *</label>
                  <input type="number" required placeholder="100" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full mt-1 p-2.5 border rounded-xl bg-background text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Unit Price (₨) *</label>
                  <input type="number" step="0.01" required placeholder="25.00" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full mt-1 p-2.5 border rounded-xl bg-background text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">Expiry Date *</label>
                  <input type="date" required value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full mt-1 p-2.5 border rounded-xl bg-background text-sm" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="flex-1 border py-2.5 rounded-xl font-semibold text-sm hover:bg-muted">Cancel</button>
                <button type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-bold text-sm hover:opacity-90 shadow">
                  Add to Stock
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
            <Pill className="h-6 w-6 text-primary" /> Pharmacy & Medicine Inventory
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage drug stock, batch tracking, expiry alerts, and dispensary records.
          </p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 shadow">
          <Plus className="h-4 w-4" /> Add Medicine Batch
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: medicines.length, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200" },
          { label: "Inventory Value", value: `₨ ${totalValue.toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200" },
          { label: "Low Stock Items", value: lowStock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200" },
          { label: "Expiring Soon (90d)", value: nearExpiry, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200" },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.bg}`}>
            <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Medicine Table */}
      <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-primary" />
            Stock Catalog ({filteredMedicines.length} items)
          </h2>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Search medicine, generic, category..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl bg-background text-sm" />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading inventory catalog...</p>
        ) : filteredMedicines.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No medicines found. Add your first batch.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground font-bold uppercase tracking-wide border-b">
                <tr>
                  <th className="p-4">Medicine Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Batch No</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Unit Price</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredMedicines.map((m) => {
                  const expiryDate = new Date(m.expiryDate)
                  const daysLeft = Math.round((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  const isExpiringSoon = daysLeft < 90 && daysLeft > 0
                  const isExpired = daysLeft <= 0

                  return (
                    <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.genericName || "—"}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-lg bg-muted text-xs font-semibold">{m.category}</span>
                      </td>
                      <td className="p-4 font-mono text-xs text-muted-foreground">{m.batchNo}</td>
                      <td className="p-4">
                        <span className={`font-bold text-base ${m.stockQuantity <= 20 ? "text-amber-600" : "text-foreground"}`}>
                          {m.stockQuantity}
                        </span>
                        {m.stockQuantity <= 20 && m.stockQuantity > 0 && (
                          <div className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" /> Low Stock
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-semibold">₨ {m.unitPrice}</td>
                      <td className="p-4">
                        <div className="text-xs font-mono">{expiryDate.toLocaleDateString()}</div>
                        {isExpiringSoon && !isExpired && (
                          <div className="text-[10px] text-amber-600 font-semibold">{daysLeft}d left</div>
                        )}
                        {isExpired && (
                          <div className="text-[10px] text-rose-600 font-bold">EXPIRED</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          isExpired ? "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30" :
                          m.stockQuantity === 0 ? "bg-slate-100 text-slate-600 border-slate-200" :
                          isExpiringSoon ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30" :
                          "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30"
                        }`}>
                          {isExpired ? "Expired" : m.stockQuantity === 0 ? "Out of Stock" : isExpiringSoon ? "Expiring Soon" : "Available"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
