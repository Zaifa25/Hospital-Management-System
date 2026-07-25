"use client"

import { useParams, useRouter } from "next/navigation"
import { CRUDPage } from "@/components/crud/crud-page"
import { entityConfigs } from "@/lib/entities"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

const hrAllowedEntities = ["employees", "attendance", "payroll"]

export default function EntityPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const entity = params?.entity as string
  const config = entityConfigs[entity]

  if (!config) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Not Found</h1>
        <p className="text-muted-foreground">Unknown entity: {entity}</p>
      </div>
    )
  }

  // HR Role Guard (roleId === 5)
  if (user?.roleId === 5 && !hrAllowedEntities.includes(entity)) {
    return (
      <div className="py-12 flex justify-center">
        <Card className="max-w-md w-full text-center border-destructive/30 shadow-lg">
          <CardHeader>
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="text-xl">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              As an HR Manager, your account permissions are limited exclusively to HR Management modules (Employees, Attendance, and Payroll).
            </p>
            <Button onClick={() => router.push("/admin/employees")}>
              Go to HR Directory
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <CRUDPage config={config} />
}
