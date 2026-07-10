"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, CheckCheck, Clock } from "lucide-react"
import axios from "axios"

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled"

const statusConfig: Record<AppointmentStatus, { label: string; icon: React.ElementType; classes: string }> = {
  scheduled: {
    label: "Scheduled",
    icon: Clock,
    classes: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  completed: {
    label: "Completed",
    icon: CheckCheck,
    classes: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    classes: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
}

type NextAction = { label: string; next: AppointmentStatus; variant: "outline" | "destructive" | "default" }

const nextActions: Record<AppointmentStatus, NextAction[]> = {
  scheduled: [{ label: "Confirm", next: "confirmed", variant: "outline" }],
  confirmed: [
    { label: "Complete ✓", next: "completed", variant: "default" },
    { label: "Cancel", next: "cancelled", variant: "destructive" },
  ],
  completed: [],
  cancelled: [],
}

interface StatusActionsProps {
  appointment: any
  onChanged?: () => void
}

export function StatusActions({ appointment, onChanged }: StatusActionsProps) {
  const [loading, setLoading] = useState(false)
  const status = ((appointment.status as string) || "scheduled") as AppointmentStatus
  const cfg = statusConfig[status] ?? statusConfig.scheduled
  const Icon = cfg.icon
  const actions = nextActions[status] ?? []

  async function handleChange(newStatus: AppointmentStatus) {
    setLoading(true)
    try {
      const token = localStorage.getItem("hms_jwt")
      // Send minimal patch — only update status field
      await axios.put(
        `http://localhost:5000/api/appointments/${appointment.id}`,
        {
          patientId: Number(appointment.patientId),
          doctorId: Number(appointment.doctorId),
          departmentId: Number(appointment.departmentId),
          type: appointment.type,
          date: appointment.date,
          time: appointment.time,
          day: appointment.day,
          tokenNo: Number(appointment.tokenNo),
          appointNo: Number(appointment.appointNo),
          reason: appointment.reason ?? "",
          status: newStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      )
      toast({ title: `Appointment ${newStatus}`, description: `#${appointment.appointNo} status updated` })
      onChanged?.()
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.response?.data?.message ?? err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
      {/* Status Badge */}
      <span
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium shrink-0 ${cfg.classes}`}
      >
        <Icon className="h-3 w-3" />
        {cfg.label}
      </span>

      {/* Action Buttons */}
      {actions.map((a) => (
        <Button
          key={a.next}
          size="sm"
          variant={a.variant}
          className="h-6 text-xs px-2 py-0 shrink-0"
          disabled={loading}
          onClick={() => handleChange(a.next)}
        >
          {a.label}
        </Button>
      ))}
    </div>
  )
}
