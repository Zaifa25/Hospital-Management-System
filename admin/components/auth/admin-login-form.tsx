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

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type FormValues = z.infer<typeof schema>

export function AdminLoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const [loading, setLoading] = useState(false)
  const { setToken } = useAuth()
  const router = useRouter()

  async function onSubmit(values: FormValues) {
    setLoading(true)
    try {
      // TODO: Replace with real API call: POST /auth/admin/login -> returns JWT
      const fakeToken = "fake-jwt-token"
      setToken(fakeToken, { role: "admin", email: values.email })
      toast({ title: "Admin logged in", description: "Welcome, Admin" })
      router.push("/admin")
    } catch {
      toast({ title: "Admin login failed", description: "Invalid credentials", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1">
        <Label htmlFor="email">Admin Email</Label>
        <Input id="email" type="email" placeholder="admin@hospital.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Admin Login"}
      </Button>
    </form>
  )
}
