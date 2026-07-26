import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number into Pakistani Rupee (PKR / ₨) currency representation.
 */
export function formatPKR(amount: number | string | null | undefined): string {
  const num = Number(amount) || 0
  return `₨ ${num.toLocaleString("en-PK")}`
}

/**
 * Safely format an ISO date string into a readable local date.
 */
export function formatPKDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return String(dateStr)
  }
}
