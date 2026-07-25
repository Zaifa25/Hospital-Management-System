"use client"

import { z } from "zod"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusActions } from "@/components/appointments/status-actions"

export type FieldConfig = {
  name: string
  label: string
  type?: "text" | "number" | "select"
  inputType?: string
  placeholder?: string
  options?: { label: string; value: string | number }[]
  coerce?: (v: string) => any
  rows?: number  // for textarea fields
}

export type EntityConfig = {
  key: string
  title: string
  single: string
  description?: string
  endpoint: string
  defaults: any
  schema: any
  fields: FieldConfig[]
  columns: (actions: {
    onEdit: (row: any) => void
    onDelete: (row: any) => void
    /** Navigate to a detail sub-page (e.g. schedule, history, receipt) */
    onNavigate?: (path: string) => void
    /** Callback after an inline status change so the table can refresh */
    onStatusChange?: () => void
  }) => ColumnDef<any, any>[]
}

// Helpers
const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

import { useDepartments } from "@/hooks/use-departments"

export const entityConfigs: Record<string, EntityConfig> = {
  doctors: {
    key: "doctors",
    title: "Doctors Management",
    single: "Doctor",
    description: "Create, update, and manage doctors.",
    endpoint: "/doctors",
    defaults: { name: "", email: "", departmentId: "", status: "active", password: "", phone: "", qualification: "", experience: "", address: "", description: "", profilePicture: null },
    schema: z.object({
      id: z.any().optional(),
      name: z.string().min(2),
      email: z.string().email(),
      departmentId: z.coerce.number().min(1),
      status: z.enum(["active", "inactive"]),
      password: z.string().min(6).optional(),
      phone: z.string().optional().nullable(),
      qualification: z.string().optional().nullable(),
      experience: z.string().optional().nullable(),
      address: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      profilePicture: z.any().optional().nullable(),
    }),
    fields: [
      { name: "profilePicture", label: "Profile Picture", inputType: "file" },
      { name: "name", label: "Full Name", placeholder: "Dr. Jane Doe" },
      { name: "email", label: "Email", inputType: "email", placeholder: "doctor@hospital.com" },
      { name: "phone", label: "Phone", placeholder: "03001234567" },
      { name: "qualification", label: "Qualification", placeholder: "MBBS, FCPS" },
      { name: "experience", label: "Experience", placeholder: "10 Years" },
      { name: "address", label: "Address", placeholder: "123 Main St" },
      { name: "description", label: "Bio / Description", inputType: "textarea", placeholder: "Brief professional bio or specialization notes...", rows: 3 },
      { 
        name: "departmentId", 
        label: "Department", 
        type: "select",
        placeholder: "Select Department",
        coerce: (v) => Number(v),
        options: [], 
      },
      { name: "status", label: "Status", type: "select", options: statusOptions },
      { name: "password", label: "Password", inputType: "password", placeholder: "••••••••" },
    ],
    columns: ({ onEdit, onDelete, onNavigate }) => [
      { header: "Name", accessorKey: "name" },
      { header: "Email", accessorKey: "email" },
      { 
        header: "Department", 
        accessorKey: "department",
        cell: ({ row }) => {
          // Show department name if available, fall back to id
          return row.original.department?.name || row.original.department || row.original.departmentId || ''
        }
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const v = String(getValue())
          return (
            <Badge variant={v === "active" ? "default" : "secondary"} className="capitalize">
              {v}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigate?.(`/admin/doctors/${row.original.id}`)}
            >
              Schedule
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
  },

  patients: {
    key: "patients",
    title: "Patient Management",
    single: "Patient",
    description: "Manage patient records and details.",
  endpoint: "/patients",
    defaults: { 
      mrNo: "",
      registration: new Date().toISOString().split('T')[0] + 'T00:00:00',
      fullName: "",
      sex: "male",
      age: 0,
      maritalStatus: "single",
      phone: "",
      status: "active",
      email: "",
      occupation: "",
      membership: "",
      address: "",
      fee: 0,
    },
    schema: z.object({
      id: z.any().optional(),
      mrNo: z.string().min(1, "MR Number is required"),
      registration: z.string().transform((val) => new Date(val).toISOString()),
      fullName: z.string().min(2, "Full name must be at least 2 characters"),
      sex: z.enum(["male", "female", "other"]),
      age: z.coerce.number().min(0, "Age must be a positive number"),
      maritalStatus: z.enum(["single", "married", "divorced", "widowed"]),
      phone: z.string().min(11, "Phone must be at least 11 digits").max(15),
      status: z.enum(["active", "inactive"]),
      email: z.string().email("Invalid email address"),
      occupation: z.string().min(2, "Occupation must be at least 2 characters"),
      membership: z.string().optional(),
      address: z.string().min(5, "Address must be at least 5 characters"),
      fee: z.coerce.number()
        .min(0, "Fees must be a positive number")
        .transform(val => Number(val.toFixed(2))), // Ensure double precision
    }),
    fields: [
      { name: "mrNo", label: "MR Number", placeholder: "MR12345" },
      { 
        name: "registration", 
        label: "Registration Date", 
        inputType: "datetime-local",
        coerce: (v: string) => new Date(v).toISOString(),
      },
      { name: "fullName", label: "Full Name", placeholder: "John Smith" },
      {
        name: "sex",
        label: "Sex",
        type: "select",
        options: [
          { label: "Male", value: "male" },
          { label: "Female", value: "female" },
          { label: "Other", value: "other" },
        ],
      },
      { 
        name: "age", 
        label: "Age", 
        type: "number", 
        inputType: "number", 
        placeholder: "25",
        coerce: (v) => Number(v),
      },
      {
        name: "maritalStatus",
        label: "Marital Status",
        type: "select",
        options: [
          { label: "Single", value: "single" },
          { label: "Married", value: "married" },
          { label: "Divorced", value: "divorced" },
          { label: "Widowed", value: "widowed" },
        ],
      },
      { name: "phone", label: "Phone", placeholder: "03001234567" },
      { 
        name: "status", 
        label: "Status", 
        type: "select", 
        options: statusOptions 
      },
      { name: "email", label: "Email", inputType: "email", placeholder: "patient@example.com" },
      { name: "occupation", label: "Occupation", placeholder: "Engineer" },
      { name: "membership", label: "Membership", placeholder: "Gold/Silver/etc" },
      { name: "address", label: "Address", placeholder: "123 Main St, City" },
      { 
        name: "fee", 
        label: "Fee", 
        type: "number", 
        inputType: "number", 
        placeholder: "1000.00",
        coerce: (v) => Number(Number(v).toFixed(2)),
      },
    ],
    columns: ({ onEdit, onDelete, onNavigate }) => [
      { header: "MR#", accessorKey: "mrNo" },
      { 
        header: "Registration", 
        accessorKey: "registration",
        cell: ({ getValue }) => {
          const v = getValue() as string
          if (!v) return ""
          return new Date(v).toLocaleString()
        }
      },
      { header: "Name", accessorKey: "fullName" },
      { header: "Sex", accessorKey: "sex", className: "capitalize" },
      { header: "Age", accessorKey: "age" },
      { header: "Marital Status", accessorKey: "maritalStatus", className: "capitalize" },
      { header: "Phone", accessorKey: "phone" },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const v = String(getValue())
          return (
            <Badge variant={v === "active" ? "default" : "secondary"} className="capitalize">
              {v}
            </Badge>
          )
        },
      },
      { header: "Email", accessorKey: "email" },
      { header: "Occupation", accessorKey: "occupation" },
      { header: "Membership", accessorKey: "membership" },
      { header: "Address", accessorKey: "address" },
      { 
        header: "Fee", 
        accessorKey: "fee",
        cell: ({ getValue }) => {
          const v = getValue() as number
          return v?.toFixed(2) || "0.00"
        }
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigate?.(`/admin/patients/${row.original.id}`)}
            >
              History
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
  },

  appointments: {
    key: "appointments",
    title: "Appointment Management",
    single: "Appointment",
    description: "Schedule and manage appointments.",
    endpoint: "/appointments",
    defaults: {
      patientId: "",
      doctorId: "",
      type: "",
      departmentId: "",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      day: "",
      tokenNo: 1,
      appointNo: Math.floor(Math.random() * 10000) + 1000,
      reason: "",
      status: "scheduled"
    },
    schema: z.object({
      id: z.any().optional(),
      patientId: z.coerce.number().min(1),
      doctorId: z.coerce.number().min(1),
      type: z.string().min(1, "Type is required"),
      departmentId: z.coerce.number().min(1),
      date: z.string().transform((val) => new Date(val).toISOString()),
      time: z.string().min(1, "Time is required"),
      day: z.string().min(1, "Day is required"),
      tokenNo: z.coerce.number().min(1),
      appointNo: z.coerce.number().min(1),
      reason: z.string().min(1, "Reason is required"),
      status: z.enum(["scheduled", "confirmed", "completed", "cancelled"]),
    }),
    fields: [
      { name: "patientId", label: "Patient", type: "select", placeholder: "Select Patient", options: [], coerce: (v) => Number(v) },
      { name: "doctorId", label: "Doctor", type: "select", placeholder: "Select Doctor", options: [], coerce: (v) => Number(v) },
      { name: "type", label: "Type", placeholder: "Consultation/Follow-up/etc" },
      { name: "departmentId", label: "Department", type: "select", placeholder: "Select Department", options: [], coerce: (v) => Number(v) },
      {
        name: "date",
        label: "Date",
        inputType: "date",
        coerce: (v: string) => (v ? new Date(v).toISOString() : v),
      },
      {
        name: "time",
        label: "Time",
        inputType: "time",
        placeholder: "HH:MM",
      },
      { name: "day", label: "Day", placeholder: "Monday" },
      { 
        name: "tokenNo", 
        label: "Token No", 
        type: "number", 
        inputType: "number",
        placeholder: "Auto-generated", 
        coerce: (v) => Number(v)
      },
      { 
        name: "appointNo", 
        label: "Appointment No", 
        type: "number", 
        inputType: "number",
        placeholder: "Auto-generated", 
        coerce: (v) => Number(v)
      },
      { name: "reason", label: "Reason", placeholder: "Reason for appointment" },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Scheduled", value: "scheduled" },
          { label: "Confirmed", value: "confirmed" },
          { label: "Completed", value: "completed" },
          { label: "Cancelled", value: "cancelled" },
        ],
      },
    ],
    columns: ({ onEdit, onDelete, onStatusChange }) => [
      { header: "Patient", accessorKey: "patient", cell: ({ row }) => row.original.patient?.fullName || row.original.patient || row.original.patientId || '' },
      { header: "Doctor", accessorKey: "doctor", cell: ({ row }) => row.original.doctor?.name || row.original.doctor || row.original.doctorId || '' },
      { header: "Type", accessorKey: "type" },
      { header: "Department", accessorKey: "department", cell: ({ row }) => row.original.department?.name || row.original.department || row.original.departmentId || '' },
      { 
        header: "Date", 
        accessorKey: "date", 
        cell: ({ getValue }) => { 
          const v = getValue() as string; 
          if (!v) return ""; 
          try { 
            return new Date(v).toLocaleDateString() 
          } catch { 
            return String(v) 
          } 
        } 
      },
      { header: "Time", accessorKey: "time" },
      { header: "Day", accessorKey: "day" },
      { header: "Token No", accessorKey: "tokenNo" },
      { header: "Appointment No", accessorKey: "appointNo" },
      { header: "Reason", accessorKey: "reason" },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <StatusActions appointment={row.original} onChanged={onStatusChange} />
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
  },

  payments: {
    key: "payments",
    title: "Payment Management",
    single: "Payment",
    description: "Track and manage payments.",
    endpoint: "/payments",
    // patientId will be selected from patients (options populated by form). mrNo will be auto-filled in the form when a patient is chosen.
  defaults: { patientId: "", date: new Date().toISOString().split('T')[0] + 'T00:00:00', method: "cash", mrNo: "", preBalance: 0, netTotal: 0, paid: 0, xrayCharge: 0, xrayPaid: 0, status: "pending" },
    schema: z.object({
      id: z.any().optional(),
      patientId: z.coerce.number().min(1),
      date: z.string().transform((val) => new Date(val).toISOString()),
      method: z.enum(["cash", "card", "insurance"]),
      mrNo: z.string().optional(),
      preBalance: z.coerce.number().min(0).transform((v) => Number(Number(v).toFixed(2))),
      netTotal: z.coerce.number().min(0).transform((v) => Number(Number(v).toFixed(2))),
      paid: z.coerce.number().min(0).transform((v) => Number(Number(v).toFixed(2))),
      xrayCharge: z.coerce.number().min(0).transform((v) => Number(Number(v).toFixed(2))).optional().default(0),
      xrayPaid: z.coerce.number().min(0).transform((v) => Number(Number(v).toFixed(2))).optional().default(0),
      status: z.enum(["pending", "paid", "failed"]),
    }),
    fields: [
      { name: "patientId", label: "Patient", type: "select", placeholder: "Select Patient", options: [], coerce: (v) => Number(v) },
      {
        name: "date",
        label: "Date",
        inputType: "datetime-local",
        coerce: (v: string) => (v ? new Date(v).toISOString() : v),
      },
      {
        name: "method",
        label: "Method",
        type: "select",
        options: [
          { label: "Cash", value: "cash" },
          { label: "Card", value: "card" },
          { label: "Insurance", value: "insurance" },
        ],
      },
      { name: "mrNo", label: "MR Number", placeholder: "Auto-filled from selected patient" },
      {
        name: "preBalance",
        label: "Pre Balance",
        type: "number",
        inputType: "number",
        coerce: (v) => Number(Number(v).toFixed(2)),
        placeholder: "0.00",
      },
      {
        name: "netTotal",
        label: "Net Total",
        type: "number",
        inputType: "number",
        coerce: (v) => Number(Number(v).toFixed(2)),
        placeholder: "0.00",
      },
      {
        name: "paid",
        label: "Paid",
        type: "number",
        inputType: "number",
        coerce: (v) => Number(Number(v).toFixed(2)),
        placeholder: "0.00",
      },
      {
        name: "xrayCharge",
        label: "XRay Charge",
        type: "number",
        inputType: "number",
        coerce: (v) => Number(Number(v).toFixed(2)),
        placeholder: "0.00",
      },
      {
        name: "xrayPaid",
        label: "XRay Paid",
        type: "number",
        inputType: "number",
        coerce: (v) => Number(Number(v).toFixed(2)),
        placeholder: "0.00",
      },
      { name: "status", label: "Status", type: "select", options: [ { label: "Pending", value: "pending" }, { label: "Paid", value: "paid" }, { label: "Failed", value: "failed" } ] },
    ],
    columns: ({ onEdit, onDelete, onNavigate }) => [
      { header: "MR#", accessorKey: "mrNo" },
      { header: "Patient", accessorKey: "patient", cell: ({ row }) => row.original.patient?.fullName || row.original.patient || '' },
      {
        header: "Date",
        accessorKey: "date",
        cell: ({ getValue }) => {
          const v = getValue() as string
          if (!v) return ""
          try { return new Date(v).toLocaleString() } catch { return String(v) }
        }
      },
      { header: "Method", accessorKey: "method" },
      { header: "Pre Balance", accessorKey: "preBalance", cell: ({ getValue }) => (Number(getValue() ?? 0).toFixed(2)) },
      { header: "Net Total", accessorKey: "netTotal", cell: ({ getValue }) => (Number(getValue() ?? 0).toFixed(2)) },
      { header: "Paid", accessorKey: "paid", cell: ({ getValue }) => (Number(getValue() ?? 0).toFixed(2)) },
      { header: "XRay Charge", accessorKey: "xrayCharge", cell: ({ getValue }) => (Number(getValue() ?? 0).toFixed(2)) },
      { header: "XRay Paid", accessorKey: "xrayPaid", cell: ({ getValue }) => (Number(getValue() ?? 0).toFixed(2)) },
      { header: "Status", accessorKey: "status", cell: ({ getValue }) => {
          const v = String(getValue())
          return (
            <Badge variant={v === "paid" ? "default" : "secondary"} className="capitalize">
              {v}
            </Badge>
          )
        }
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onNavigate?.(`/admin/payments/${row.original.id}/receipt`)}
            >
              Receipt
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
  },

  departments: {
    key: "departments",
    title: "Department Management",
    single: "Department",
    description: "Manage hospital departments.",
    endpoint: "/departments",
    // add displaySequence as an integer so departments can be ordered/displayed by sequence
    defaults: { name: "", status: "active", displaySequence: 0 },
    schema: z.object({
      id: z.any().optional(),
      name: z.string().min(2),
      status: z.enum(["active", "inactive"]),
      displaySequence: z.coerce.number().min(0).optional().default(0),
    }),
    fields: [
      { name: "name", label: "Name", placeholder: "Radiology" },
      { name: "displaySequence", label: "Display Sequence", type: "number", inputType: "number", placeholder: "1", coerce: (v) => Number(v) },
      { name: "status", label: "Status", type: "select", options: statusOptions },
    ],
    columns: ({ onEdit, onDelete }) => [
      { header: "Name", accessorKey: "name" },
      { header: "Sequence", accessorKey: "displaySequence" },
      { header: "Status", accessorKey: "status" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
  },

  receptionists: {
    key: "receptionists",
    title: "Receptionist Management",
    single: "Receptionist",
    description: "Create, update, and manage receptionists.",
    endpoint: "/receptionists",
    defaults: { name: "", email: "", phone: "", address: "", status: "Active", password: "" },
    schema: z.object({
      id: z.any().optional(),
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      address: z.string().optional(),
      status: z.enum(["Active", "Inactive", "active", "inactive"]).optional().default("Active"),
      password: z.string().min(6).optional(),
    }),
    fields: [
      { name: "name", label: "Name", placeholder: "Jane Doe" },
      { name: "email", label: "Email", inputType: "email", placeholder: "receptionist@hospital.com" },
      { name: "phone", label: "Phone", placeholder: "03001234567" },
      { name: "address", label: "Address", placeholder: "123 Main St" },
      { name: "status", label: "Status", type: "select", options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ] },
      { name: "password", label: "Password", inputType: "password", placeholder: "••••••••" },
    ],
    columns: ({ onEdit, onDelete }) => [
      { header: "Name", accessorKey: "name" },
      { header: "Email", accessorKey: "email" },
      { header: "Phone", accessorKey: "phone" },
      { header: "Address", accessorKey: "address" },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const v = String(getValue())
          return (
            <Badge variant={v.toLowerCase() === "active" ? "default" : "secondary"} className="capitalize">
              {v}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
  },

  employees: {
    key: "employees",
    title: "Employee Directory",
    single: "Employee",
    description: "Manage hospital staff, designations, and salaries.",
    endpoint: "/employees",
    defaults: { name: "", email: "", phone: "", cnic: "", type: "Nurse", designation: "Senior Nurse", departmentId: 1, salary: 50000, status: "active", address: "" },
    schema: z.object({
      id: z.any().optional(),
      name: z.string().min(2, "Name is required"),
      email: z.string().email(),
      phone: z.string().min(5),
      cnic: z.string().optional(),
      type: z.string().min(1),
      designation: z.string().min(1),
      departmentId: z.coerce.number().optional(),
      salary: z.coerce.number().min(0),
      status: z.enum(["active", "on_leave", "resigned"]),
      address: z.string().optional(),
    }),
    fields: [
      { name: "name", label: "Employee Name", placeholder: "Full Name" },
      { name: "email", label: "Email", inputType: "email", placeholder: "employee@hospital.com" },
      { name: "phone", label: "Phone", placeholder: "0300-1234567" },
      { name: "cnic", label: "CNIC", placeholder: "35202-1234567-1" },
      {
        name: "type",
        label: "Employee Type",
        type: "select",
        options: [
          { label: "Nurse", value: "Nurse" },
          { label: "Doctor", value: "Doctor" },
          { label: "Technician", value: "Technician" },
          { label: "Staff", value: "Staff" },
          { label: "Receptionist", value: "Receptionist" },
          { label: "Admin", value: "Admin" },
        ],
      },
      { name: "designation", label: "Designation", placeholder: "Senior Nurse, Pharmacist..." },
      { name: "salary", label: "Basic Salary (PKR)", type: "number", inputType: "number", coerce: (v) => Number(v) },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "active" },
          { label: "On Leave", value: "on_leave" },
          { label: "Resigned", value: "resigned" },
        ],
      },
      { name: "address", label: "Address", placeholder: "Lahore, Pakistan" },
    ],
    columns: ({ onEdit, onDelete }) => [
      { header: "Name", accessorKey: "name" },
      { header: "Type", accessorKey: "type" },
      { header: "Designation", accessorKey: "designation" },
      { header: "Department", accessorKey: "department", cell: ({ row }) => row.original.department?.name || "—" },
      { header: "Phone", accessorKey: "phone" },
      { header: "CNIC", accessorKey: "cnic", cell: ({ getValue }) => getValue() || "—" },
      {
        header: "Salary",
        accessorKey: "salary",
        cell: ({ getValue }) => `₨ ${(Number(getValue()) || 0).toLocaleString()}`,
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const v = String(getValue() || "active")
          return (
            <Badge variant={v === "active" ? "default" : v === "on_leave" ? "outline" : "destructive"} className="capitalize">
              {v.replace("_", " ")}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
  },

  attendance: {
    key: "attendance",
    title: "Attendance Tracker",
    single: "Attendance Record",
    description: "Mark and monitor daily employee attendance.",
    endpoint: "/attendance",
    defaults: { employeeId: "", date: new Date().toISOString().split("T")[0], status: "Present", checkIn: "09:00 AM", checkOut: "05:00 PM", notes: "" },
    schema: z.object({
      id: z.any().optional(),
      employeeId: z.coerce.number().min(1, "Employee is required"),
      date: z.string().transform((val) => new Date(val).toISOString()),
      status: z.enum(["Present", "Absent", "Late", "Half-day", "On Leave"]),
      checkIn: z.string().optional(),
      checkOut: z.string().optional(),
      notes: z.string().optional(),
    }),
    fields: [
      { name: "employeeId", label: "Select Employee", type: "select" },
      { name: "date", label: "Date", type: "text", inputType: "date" },
      {
        name: "status",
        label: "Attendance Status",
        type: "select",
        options: [
          { label: "Present", value: "Present" },
          { label: "Absent", value: "Absent" },
          { label: "Late", value: "Late" },
          { label: "Half-day", value: "Half-day" },
          { label: "On Leave", value: "On Leave" },
        ],
      },
      { name: "checkIn", label: "Check In Time", placeholder: "09:00 AM" },
      { name: "checkOut", label: "Check Out Time", placeholder: "05:00 PM" },
      { name: "notes", label: "Notes / Remarks", placeholder: "Traffic delay, Sick leave..." },
    ],
    columns: ({ onEdit, onDelete }) => [
      { header: "Employee", accessorKey: "employee", cell: ({ row }) => row.original.employee?.name || `Employee #${row.original.employeeId}` },
      {
        header: "Date",
        accessorKey: "date",
        cell: ({ getValue }) => {
          const v = getValue() as string
          if (!v) return "—"
          try { return new Date(v).toLocaleDateString() } catch { return String(v) }
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const v = String(getValue())
          const color = v === "Present" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : v === "Late" ? "bg-amber-50 text-amber-700 border-amber-200" : v === "Absent" ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200"
          return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>{v}</span>
        },
      },
      { header: "Check In", accessorKey: "checkIn", cell: ({ getValue }) => getValue() || "—" },
      { header: "Check Out", accessorKey: "checkOut", cell: ({ getValue }) => getValue() || "—" },
      { header: "Notes", accessorKey: "notes", cell: ({ getValue }) => getValue() || "—" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
  },

  payroll: {
    key: "payroll",
    title: "Payroll & Salaries",
    single: "Payroll Record",
    description: "Manage monthly staff salaries, bonuses, deductions, and payouts.",
    endpoint: "/payrolls",
    defaults: { employeeId: "", month: "July 2026", basicSalary: 50000, bonus: 0, deductions: 0, status: "Pending" },
    schema: z.object({
      id: z.any().optional(),
      employeeId: z.coerce.number().min(1, "Employee is required"),
      month: z.string().min(1, "Month is required"),
      basicSalary: z.coerce.number().min(0),
      bonus: z.coerce.number().min(0),
      deductions: z.coerce.number().min(0),
      status: z.enum(["Pending", "Paid"]),
    }),
    fields: [
      { name: "employeeId", label: "Select Employee", type: "select" },
      { name: "month", label: "Salary Month", placeholder: "July 2026" },
      { name: "basicSalary", label: "Basic Salary (PKR)", type: "number", inputType: "number", coerce: (v) => Number(v) },
      { name: "bonus", label: "Bonus (PKR)", type: "number", inputType: "number", coerce: (v) => Number(v) },
      { name: "deductions", label: "Deductions (PKR)", type: "number", inputType: "number", coerce: (v) => Number(v) },
      {
        name: "status",
        label: "Payout Status",
        type: "select",
        options: [
          { label: "Pending", value: "Pending" },
          { label: "Paid", value: "Paid" },
        ],
      },
    ],
    columns: ({ onEdit, onDelete, onViewSlip, onMarkPaid }: any) => [
      { header: "Employee", accessorKey: "employee", cell: ({ row }) => row.original.employee?.name || `Employee #${row.original.employeeId}` },
      { header: "Month", accessorKey: "month" },
      { header: "Basic Salary", accessorKey: "basicSalary", cell: ({ getValue }) => `₨ ${(Number(getValue()) || 0).toLocaleString()}` },
      { header: "Bonus", accessorKey: "bonus", cell: ({ getValue }) => `₨ ${(Number(getValue()) || 0).toLocaleString()}` },
      { header: "Deductions", accessorKey: "deductions", cell: ({ getValue }) => `₨ ${(Number(getValue()) || 0).toLocaleString()}` },
      {
        header: "Net Salary",
        accessorKey: "netSalary",
        cell: ({ getValue }) => <span className="font-bold text-emerald-600">₨ ${(Number(getValue()) || 0).toLocaleString()}</span>,
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const v = String(getValue())
          return (
            <Badge variant={v === "Paid" ? "default" : "secondary"}>
              {v}
            </Badge>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5 items-center">
            {row.original.status !== "Paid" && onMarkPaid && (
              <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs px-2" onClick={() => onMarkPaid(row.original)}>
                Mark Paid
              </Button>
            )}
            {onViewSlip && (
              <Button size="sm" variant="outline" className="h-7 text-xs px-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={() => onViewSlip(row.original)}>
                Payslip
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => onEdit(row.original)}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" className="h-7 text-xs px-2" onClick={() => onDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
  },
}
