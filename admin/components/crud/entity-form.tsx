"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { EntityConfig, FieldConfig } from "@/lib/entities"
import { toast } from "@/hooks/use-toast"
import { mutateWithAuth } from "@/lib/api-client"
import axios from "axios"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useMemo } from "react"
import { usePatients } from "@/hooks/use-patients"
import { useDepartments } from "@/hooks/use-departments"
import { useDoctors } from "@/hooks/use-doctors"
import { useAppointmentNumbers } from "@/hooks/use-appointment-numbers"

export function EntityForm({
  open,
  onOpenChange,
  config,
  defaultValues,
  onSubmitted,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  config: EntityConfig
  defaultValues: any
  onSubmitted: () => void
}) {
  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues,
  })

  // Get next appointment numbers
  const { numbers: nextNumbers, refresh: refreshNumbers } = useAppointmentNumbers();

  useEffect(() => {
    // For new appointments, set the auto-incrementing numbers
    if (config.key === "appointments" && !defaultValues.id) {
      form.reset({
        ...defaultValues,
        tokenNo: nextNumbers.tokenNo,
        appointNo: nextNumbers.appointNo
      });
    } else {
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, nextNumbers, config.key])

  async function onSubmit(values: any) {
    try {
      const isUpdate = Boolean(values.id)
      // Use axios for departments, doctors, dsas, and patients entities
      if (config.key === "departments" || config.key === "doctors" || config.key === "dsas" || config.key === "patients" || config.key==="procedures" || config.key==="payments" || config.key==="appointments") {
        const url = `http://localhost:5000/api${isUpdate ? `${config.endpoint}/${values.id}` : config.endpoint}`
        const token = localStorage.getItem("hms_jwt")

        // Format the data specifically for doctors
        let data = values
        if (config.key === "doctors") {
          data = {
            ...values,
            departmentId: values.departmentId ? Number(values.departmentId) : undefined, // Ensure it's a number
            password: values.password || undefined // Only include if provided
          }
        }
        // For DSAs no special formatting required at this time

        console.log('Sending data to server:', data) // Debug log

        const response = await axios({
          url,
          method: isUpdate ? "put" : "post",
          data,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        
        console.log('Server response:', response.data) // Debug log

        // Refresh appointment numbers after successful creation
        if (config.key === "appointments" && !isUpdate) {
          refreshNumbers();
        }
      } else {
        await mutateWithAuth(isUpdate ? `${config.endpoint}/${values.id}` : config.endpoint, {
          method: isUpdate ? "PUT" : "POST",
          body: JSON.stringify(values),
        })
      }
      toast({ title: `${config.single} ${isUpdate ? "updated" : "created"}` })
      onSubmitted()
    } catch (error: any) {
      console.error('Submit error:', error)
      // Show more detailed error message
      const errorMessage = error.response?.data?.message || error.message || "Save failed"
      toast({ 
        title: "Error saving",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // Fetch departments, patients, and doctors for select options
  const { departments } = useDepartments()
  const { patients } = usePatients()
  const { doctors } = useDoctors()

  // Enhance field options for doctors, procedures, payments, and appointments
  const fields = useMemo(() => {
    if (!["doctors", "procedures", "payments", "appointments"].includes(config.key)) return config.fields
    return config.fields.map((field) => {
      if (field.name === "departmentId") {
        return {
          ...field,
          options: departments,
        }
      }
      if ((config.key === "payments" || config.key === "appointments") && field.name === "patientId") {
        return {
          ...field,
          options: patients,
        }
      }
      if (config.key === "appointments" && field.name === "doctorId") {
        return {
          ...field,
          options: doctors,
        }
      }
      return field
    })
  }, [config.fields, config.key, departments, patients, doctors])

  // Auto-fill mrNo in payments form when patientId changes
  useEffect(() => {
    if (config.key !== "payments") return
    const subscription = form.watch((value, { name }) => {
      if (name !== "patientId") return
      const pid = value.patientId
      if (pid == null) return
      const selected = patients.find((p) => String(p.value) === String(pid) || Number(p.value) === Number(pid))
      if (selected) {
        form.setValue("mrNo", selected.mrNo ?? "", { shouldValidate: true })
      }
    })
    return () => subscription.unsubscribe?.()
  }, [form, patients, config.key])

  function renderField(f: FieldConfig) {
    const key = f.name as any
    switch (f.type) {
      case "select":
        return (
          <div className="space-y-1" key={f.name}>
            <Label htmlFor={f.name}>{f.label}</Label>
            <Select
              value={String(form.getValues()[key] ?? "")}
              onValueChange={(v) => form.setValue(key, f.coerce ? f.coerce(v) : v, { shouldValidate: true })}
            >
              <SelectTrigger id={f.name}>
                <SelectValue placeholder={f.placeholder ?? `Select ${f.label}`} />
              </SelectTrigger>
              <SelectContent>
                {f.options?.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors[key]?.message ? (
              <p className="text-xs text-destructive">{String(form.formState.errors[key]?.message)}</p>
            ) : null}
          </div>
        )
      default:
        return (
          <div className="space-y-1" key={f.name}>
            <Label htmlFor={f.name}>{f.label}</Label>
            <Input 
              id={f.name} 
              placeholder={f.placeholder} 
              type={f.inputType ?? "text"} 
              readOnly={config.key === "appointments" && (f.name === "tokenNo" || f.name === "appointNo")}
              {...form.register(key)} 
            />
            {form.formState.errors[key]?.message ? (
              <p className="text-xs text-destructive">{String(form.formState.errors[key]?.message)}</p>
            ) : null}
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{defaultValues?.id ? `Edit ${config.single}` : `Create ${config.single}`}</DialogTitle>
        </DialogHeader>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-3" onSubmit={form.handleSubmit(onSubmit)}>
          {fields.map(renderField)}
          <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
