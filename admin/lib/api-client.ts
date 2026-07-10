"use client"

import { useAuth } from "@/hooks/use-auth"

const BASE = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL || "" : ""

export async function fetcher(path: string) {
  const url = withBase(path)
  const res = await fetch(url, {
    headers: authHeaders(),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchJSON(path: string, init?: RequestInit) {
  const url = withBase(path)
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function mutateWithAuth(path: string, init?: RequestInit) {
  const url = withBase(path)
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) throw new Error(await res.text())
  // some backends return body on mutation; ignore here
  return res.ok
}

function withBase(path: string) {
  if (!path.startsWith("http")) {
    return `${BASE}${path}`
  }
  return path
}

function authHeaders() {
  if (typeof window === "undefined") return {}
  const token = localStorage.getItem("hms_jwt")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Convenience hook for components (if needed)
export function useApi() {
  const { token } = useAuth()
  return { token, baseUrl: BASE }
}
