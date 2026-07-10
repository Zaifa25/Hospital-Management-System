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

export function CRUDPage({ config }: { config: EntityConfig }) {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [editing, setEditing] = useState<any | null>(null)
  const [openForm, setOpenForm] = useState(false)
  const router = useRouter()

  const params = useMemo(
    () => new URLSearchParams({ q: query, page: String(page), pageSize: String(pageSize) }).toString(),
    [query, page, pageSize],
  )

  // Use full API URL for departments to match backend (axios calls below use same base)
  const useAxiosApi = config.key === "departments" || config.key === "doctors" || config.key === "dsas" || config.key === "patients" || config.key==="procedures" || config.key==="payments" || config.key==="appointments"
  const swrKey = useAxiosApi ? `http://localhost:5000/api${config.endpoint}?${params}` : `${config.endpoint}?${params}`

  const fetcher = async (url: string) => {
    if (config.key === "departments" || config.key === "doctors" || config.key === "dsas" || config.key === "patients" || config.key==="procedures" || config.key==="payments" || config.key==="appointments") {
      const token = localStorage.getItem("hms_jwt")
      const res = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
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
          const base = `http://localhost:5000/api`
          const headers = {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          }

          const [pRes, docRes, depRes] = await Promise.all([
            axios.get(`${base}/patients`, { headers }),
            axios.get(`${base}/doctors`, { headers }),
            axios.get(`${base}/departments`, { headers }),
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
          // If related fetch fails, fall back to the lightweight mapping (ids -> placeholder)
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
    return fetchJSON(url)
  }

  const { data, isLoading, mutate } = useSWR<{ items: any[]; total: number }>(swrKey, fetcher, {
    refreshInterval: 10000,
  })

  async function handleDelete(row: any) {
    try {
  if (config.key === "departments" || config.key === "doctors" || config.key === "dsas" || config.key === "patients"|| config.key==="procedures" || config.key==="payments" || config.key==="appointments") {
        const token = localStorage.getItem("hms_jwt")
        await axios.delete(`http://localhost:5000/api${config.endpoint}/${row.id}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
      } else {
        await mutateWithAuth(`${config.endpoint}/${row.id}`, { method: "DELETE" })
      }
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
        <Button
          onClick={() => {
            setEditing(null)
            setOpenForm(true)
          }}
        >
          Create {config.single}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder={`Search ${config.title.toLowerCase()}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground" htmlFor="pageSize">
              Rows
            </label>
            <select
              id="pageSize"
              className="rounded-md border bg-background px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
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
          onEdit: (row) => {
            setEditing(row)
            setOpenForm(true)
          },
          onDelete: handleDelete,
          onNavigate: (path) => router.push(path),
          onStatusChange: () => mutate(),
        })}
        data={data?.items ?? []}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        total={data?.total ?? 0}
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
    </div>
  )
}
