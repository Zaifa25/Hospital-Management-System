"use client"

import type React from "react"

import { Sidebar } from "@/components/admin/sidebar"
import { Topbar } from "@/components/admin/topbar"
import { useAuth, isAdmin, isDoctor, isDSA } from "@/hooks/use-auth"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

// Routes only accessible by admins (roleId === 1)
const ADMIN_ONLY_ROUTES = ["/admin/doctors", "/admin/dsas", "/admin/departments", "/admin/procedures"]
// Routes accessible by admin + DSA only (not doctors)
const NO_DOCTOR_ROUTES = ["/admin/payments"]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { token, user, initialized } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!initialized) return
    if (!token) {
      router.replace("/")
      return
    }
    // Role-based route guard
    if (user?.roleId) {
      const isAdminOnly = ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r))
      const isNoDoctor = NO_DOCTOR_ROUTES.some((r) => pathname.startsWith(r))
      if (isAdminOnly && !isAdmin(user)) {
        router.replace("/admin")
        return
      }
      if (isNoDoctor && isDoctor(user)) {
        router.replace("/admin")
        return
      }
    }
  }, [initialized, token, user, pathname, router])


  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <>
      {!initialized ? null : (
        <div className="min-h-dvh overflow-x-hidden">
          {/* Mobile: topbar with drawer */}
          <div className="md:hidden">
            <Topbar onMenu={() => setSidebarOpen(true)} />
          </div>

          {/* Mobile drawer */}
          {sidebarOpen ? (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-72 bg-sidebar border-r">
                <Sidebar onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          ) : null}

          {/* Desktop: fixed sidebar + scrollable content */}
          <aside className="fixed inset-y-0 left-0 z-40 hidden md:block w-72 border-r bg-sidebar" aria-label="Sidebar">
            <Sidebar />
          </aside>

          {/* Desktop content */}
          <div className="hidden md:flex md:pl-72 min-h-dvh flex-col overflow-x-hidden min-w-0">
            <Topbar />
            <main className="p-4 md:p-6 overflow-x-hidden min-w-0">{children}</main>
          </div>

          {/* Mobile content */}
          <div className="md:hidden">
            <main className="p-4 overflow-x-hidden min-w-0">{children}</main>
          </div>
        </div>
      )}
    </>
  )
}
