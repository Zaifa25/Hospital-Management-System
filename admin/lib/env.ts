/**
 * Central API base URL — reads from NEXT_PUBLIC_API_URL env variable.
 * All hooks and components must import from this file instead of hardcoding the URL.
 *
 * .env.local defines:  NEXT_PUBLIC_API_URL="http://localhost:5001/api"
 */
export const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api").replace(/\/+$/, "")

export function apiUrl(path: string): string {
  if (!path) return API_BASE
  const p = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE}${p}`
}

/** Returns the server root (no /api) — used for static asset URLs like profile pictures */
export const SERVER_ROOT = API_BASE.replace(/\/api\/?$/, "")
