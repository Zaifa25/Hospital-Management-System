"use client"

import { useParams } from "next/navigation"
import { CRUDPage } from "@/components/crud/crud-page"
import { entityConfigs } from "@/lib/entities"

export default function EntityPage() {
  const params = useParams()
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

  return <CRUDPage config={config} />
}
