"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { EntityConfig, FieldConfig } from "@/lib/entities"
import { toast } from "@/hooks/use-toast"
import { mutateWithAuth } from "@/lib/api-client"
import axios from "axios"
import { useAuth } from "@/hooks/use-auth"
import { apiUrl } from "@/lib/env"
import { useEffect, useMemo } from "react"
import { usePatients } from "@/hooks/use-patients"
import { useDepartments } from "@/hooks/use-departments"
import { useDoctors } from "@/hooks/use-doctors"
import { useEmployees } from "@/hooks/use-employees"
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
      const url = apiUrl(isUpdate ? `${config.endpoint}/${values.id}` : config.endpoint)
      const token = localStorage.getItem("hms_jwt")

      // Format the data specifically for doctors, attendance, payroll, employees
      let data = { ...values }
      if (config.key === "doctors") {
        data = {
          ...values,
          departmentId: values.departmentId ? Number(values.departmentId) : undefined,
          password: values.password || undefined
        }
      } else if (config.key === "payroll") {
        data = {
          ...values,
          employeeId: Number(values.employeeId),
          basicSalary: Number(values.basicSalary),
          bonus: Number(values.bonus || 0),
          deductions: Number(values.deductions || 0),
        }
      } else if (config.key === "attendance") {
        data = {
          ...values,
          employeeId: Number(values.employeeId),
        }
      } else if (config.key === "employees") {
        data = {
          ...values,
          departmentId: (values.departmentId && values.departmentId !== "") ? Number(values.departmentId) : undefined,
          salary: values.salary ? Number(values.salary) : 0,
          password: values.password || undefined,
        }
      }

      console.log('Sending data to server:', data) // Debug log

      const hasFile = Object.values(data).some(v => v instanceof File || (typeof FileList !== "undefined" && v instanceof FileList && v.length > 0));

      let requestData;
      let contentType;

      if (hasFile) {
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") {
            if (typeof FileList !== "undefined" && v instanceof FileList && v.length > 0) {
              formData.append(k, v[0]);
            } else if (v instanceof File) {
              formData.append(k, v);
            } else {
              formData.append(k, String(v));
            }
          }
        });
        requestData = formData;
        contentType = "multipart/form-data";
      } else {
        requestData = data;
        contentType = "application/json";
      }

      const response = await axios({
        url,
        method: isUpdate ? "put" : "post",
        data: requestData,
        headers: {
          "Content-Type": contentType,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      
      console.log('Server response:', response.data) // Debug log

      if (config.key === "appointments" && !isUpdate) {
        refreshNumbers();
      }
      
      toast({ title: `${config.single} ${isUpdate ? "updated" : "created"}` })
      onSubmitted()
    } catch (error: any) {
      console.error('Submit error:', error)
      const errorMessage = error.response?.data?.message || error.message || "Save failed"
      toast({ 
        title: "Error saving",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  // Fetch departments, patients, doctors, and employees for select options
  const { departments } = useDepartments()
  const { patients } = usePatients()
  const { doctors } = useDoctors()
  const { employees } = useEmployees()

  // Enhance field options for doctors, payments, appointments, attendance, and payroll
  const fields = useMemo(() => {
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
      if (field.name === "employeeId") {
        return {
          ...field,
          type: "select" as const,
          options: employees,
        }
      }
      return field
    })
  }, [config.fields, config.key, departments, patients, doctors, employees])

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
            {f.inputType === "file" ? (
              <Input 
                id={f.name} 
                type="file" 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    form.setValue(key, e.target.files[0], { shouldValidate: true })
                  }
                }}
              />
            ) : f.inputType === "textarea" ? (
              <Textarea 
                id={f.name} 
                placeholder={f.placeholder} 
                rows={f.rows ?? 3}
                {...form.register(key)} 
              />
            ) : (
              <Input 
                id={f.name} 
                placeholder={f.placeholder} 
                type={f.inputType ?? "text"} 
                readOnly={config.key === "appointments" && (f.name === "tokenNo" || f.name === "appointNo")}
                {...form.register(key)} 
              />
            )}
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
