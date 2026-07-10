"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignInForm } from "./sign-in-form"
import { RegisterForm } from "./register-form"
import { AdminLoginForm } from "./admin-login-form"

export function AuthCard() {
  return (
    <Card className="backdrop-blur bg-card/90 shadow-lg">
      <CardHeader>
        <CardTitle className="text-pretty">Hospital Management</CardTitle>
        <CardDescription>Sign in, register, or admin login to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="admin">Admin Login</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="pt-4">
            <SignInForm />
          </TabsContent>
          <TabsContent value="register" className="pt-4">
            <RegisterForm />
          </TabsContent>
          <TabsContent value="admin" className="pt-4">
            <AdminLoginForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
