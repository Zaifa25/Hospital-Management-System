"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth, isAdmin, isDoctor, isDSA } from "@/hooks/use-auth"
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  CalendarDays,
  CreditCard,
  Building2,
  ClipboardList,
  UserCog,
  X,
  Activity,
  ShieldCheck,
} from "lucide-react"

type NavLink = {
  href: string
  label: string
  icon: React.ElementType
  /** roleIds that can see this link. undefined = everyone */
  allowRoles?: number[]
}

const links: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: Activity },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope, allowRoles: [1] },
  { href: "/admin/dsas", label: "DSAs", icon: Users, allowRoles: [1] },
  { href: "/admin/patients", label: "Patients", icon: Users },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/admin/payments", label: "Payments", icon: CreditCard, allowRoles: [1, 3] },
  { href: "/admin/departments", label: "Departments", icon: Building2, allowRoles: [1] },
  { href: "/admin/procedures", label: "Procedures", icon: ClipboardList, allowRoles: [1] },
  { href: "/admin/profile", label: "Admin Profile", icon: UserCog },
]

const roleBadge: Record<number, { label: string; color: string }> = {
  1: { label: "Admin", color: "bg-primary/10 text-primary border-primary/20" },
  2: { label: "Doctor", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  3: { label: "DSA", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()

  // Filter links based on role. If roleId is undefined (old session), show all.
  const visibleLinks = links.filter((l) => {
    if (!l.allowRoles) return true          // public to all roles
    if (!user?.roleId) return true          // legacy/unknown role → show all
    return l.allowRoles.includes(user.roleId)
  })

  const roleInfo = user?.roleId ? roleBadge[user.roleId] : undefined

  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      {/* Branding */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm leading-tight">Hospital Admin</span>
          </div>
          {roleInfo && (
            <span
              className={cn(
                "mt-1.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                roleInfo.color
              )}
            >
              {roleInfo.label}
            </span>
          )}
          {user?.name && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">{user.name}</p>
          )}
        </div>
        {onClose ? (
          <button
            className="md:hidden rounded p-2 hover:bg-accent"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        ) : null}
      </div>

      <div className="mx-3 border-t" />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-2 py-3 pb-6">
        {visibleLinks.map((l) => {
          const Icon = l.icon
          const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href))
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                "hover:bg-accent hover:text-accent-foreground",
                active
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {l.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
