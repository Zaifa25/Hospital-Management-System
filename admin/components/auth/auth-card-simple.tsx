"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignInForm } from "@/components/auth/sign-in-form"
import { RegisterForm } from "@/components/auth/register-form"

export function AuthCardSimple() {
  const [tab, setTab] = useState<"sign-in" | "register">("sign-in")

  return (
    <Card className="backdrop-blur bg-background/80 border-border">
      <CardHeader>
        <CardTitle className="text-balance">Hospital Management System</CardTitle>
        <CardDescription className="text-pretty">Sign in to continue or create a new admin account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in" className="mt-4">
            <SignInForm />
          </TabsContent>
          <TabsContent value="register" className="mt-4">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
