"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import axios from "axios"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleId: z.coerce.number(),
})

type FormValues = z.infer<typeof schema>

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { roleId: 1 } })

  const [loading, setLoading] = useState(false)
  const { setToken } = useAuth()
  const router = useRouter()

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      const token = localStorage.getItem("hms_jwt")
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const res = await axios.post(`http://localhost:5000/api/auth/register`, values, { headers })
      
      const admin = res.data.admin
      const roleMap: Record<number, "admin" | "doctor" | "dsa"> = {
        1: "admin",
        2: "doctor",
        3: "dsa",
      }
      const role = roleMap[admin?.roleId ?? 1] || "admin"

      // Sign-in automatically with the newly created account if we are initial setup (not logged in)
      if (!token) {
        setToken(res.data.token, {
          role,
          roleId: admin?.roleId ?? 1,
          email: admin?.email ?? values.email,
          name: admin?.name,
        })
        toast({ title: "Account created", description: "Welcome to Hospital Management System!" })
        router.push("/admin")
      } else {
        toast({ title: "Account created", description: `Successfully created ${role.toUpperCase()} account for ${values.name}!` })
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || "Please try again"
      toast({ title: "Registration failed", description: msg, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="Dr. Jane Doe" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
      <div className="space-y-1">
        <Label htmlFor="roleId">Account Role</Label>
        <select
          id="roleId"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register("roleId")}
        >
          <option value={1}>Admin (Full Access)</option>
          <option value={3}>DSA (Discharge & Support Assistant)</option>
        </select>
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Register Account"}
      </Button>
    </form>
  )
}
