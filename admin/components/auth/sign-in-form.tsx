"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import axios from "axios"

function getApiBaseUrl() {
  // NEXT_PUBLIC_API_URL is defined as "http://localhost:5001/api" in .env.local
  // Strip trailing /api so we can append our own path segments cleanly
  const envBase = process.env.NEXT_PUBLIC_API_URL
  if (envBase) return envBase.replace(/\/api\/?$/, "")
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:5001`
  }
  return "http://localhost:5001"
}

const schema = z.object({
  role: z.enum(["admin", "doctor", "receptionist", "hr", "employee"]),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type FormValues = z.infer<typeof schema>

export function SignInForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: "admin" } })
  const [loading, setLoading] = useState(false)
  const { setToken } = useAuth()
  const router = useRouter()

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const res = await axios.post(`${getApiBaseUrl()}/api/auth/login`, values)
      
      const admin = res.data.admin
      const roleMap: Record<number, "admin" | "doctor" | "receptionist" | "hr" | "employee"> = {
        1: "admin",
        2: "doctor",
        4: "receptionist",
        5: "hr",
        6: "employee",
      }
      const role = roleMap[admin?.roleId ?? 6] || values.role || "employee"

      setToken(res.data.token, { 
        id: admin?.id,
        role, 
        roleId: admin?.roleId ?? 6,
        email: admin?.email ?? values.email, 
        name: admin?.name 
      })
      toast({ title: "Signed in", description: "Welcome back!" })
      router.push("/admin")
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || e.message || "Please check your credentials"
      toast({ title: "Sign in failed", description: errorMsg, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1">
        <Label htmlFor="role">Sign in as</Label>
        <Select
          value={watch("role")}
          onValueChange={(val: "admin" | "doctor" | "receptionist" | "hr" | "employee") => setValue("role", val, { shouldValidate: true })}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="hr">HR Manager</SelectItem>
            <SelectItem value="employee">Employee / Staff</SelectItem>
            <SelectItem value="doctor">Doctor</SelectItem>
            <SelectItem value="receptionist">Receptionist</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}
