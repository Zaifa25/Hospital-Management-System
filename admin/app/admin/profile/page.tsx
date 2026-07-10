"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { toast } from "@/hooks/use-toast"

export default function AdminProfilePage() {
  const { user } = useAuth()

  const form = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  async function onChangePassword(values: any) {
    if (values.newPassword !== values.confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" })
      return
    }
    if (!values.newPassword || values.newPassword.length < 6) {
      toast({ title: "New password must be at least 6 characters", variant: "destructive" })
      return
    }
    try {
      const token = localStorage.getItem("hms_jwt")
      await axios.put(
        "http://localhost:5000/api/auth/changePassword",
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      )
      toast({ title: "Password changed", description: "Your password was updated successfully" })
      form.reset()
    } catch (err: any) {
      console.error("Change password error:", err)
      const msg = err?.response?.data?.message || err.message || "Failed to change password"
      toast({ title: "Error", description: msg, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} readOnly />
          </div>
          <div className="space-y-1">
            <Label>Role</Label>
            <Input value={user?.role ?? ""} readOnly />
          </div>
          <div className="space-y-1 md:col-span-2">
            <p className="text-sm text-muted-foreground">
              This profile is read-only in the demo. Replace with editable fields and save to your backend.
            </p>
          </div>
          <div className="md:col-span-2">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Current Password</Label>
                <Input type="password" {...form.register("currentPassword")} />
              </div>
              <div className="space-y-1">
                <Label>New Password</Label>
                <Input type="password" {...form.register("newPassword")} />
              </div>
              <div className="space-y-1">
                <Label>Confirm Password</Label>
                <Input type="password" {...form.register("confirmPassword")} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button onClick={form.handleSubmit(onChangePassword)}>Change Password</Button>
              </div>
            </CardContent>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
