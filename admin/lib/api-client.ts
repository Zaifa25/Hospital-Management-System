"use client"

import { useAuth } from "@/hooks/use-auth"

/**
 * Base API URL derived from environment variables or fallback dev endpoint.
 */
const BASE = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api") : ""

/**
 * Generic fetcher function for SWR and standard data queries.
 * @param path Endpoint path or full URL
 */
export async function fetcher(path: string) {
  const url = withBase(path)
  const res = await fetch(url, {
    headers: authHeaders(),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/**
 * Execute JSON HTTP requests with automatic Bearer token injection.
 * @param path Endpoint path or full URL
 * @param init Request configuration options
 */
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

/**
 * Execute data mutations (POST/PUT/DELETE) with JWT authorization headers.
 * @param path Endpoint path or full URL
 * @param init Request configuration options
 */
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
  return res.ok
}

/**
 * Append base URL prefix to relative path.
 */
function withBase(path: string) {
  if (!path.startsWith("http")) {
    return `${BASE}${path}`
  }
  return path
}

/**
 * Retrieve authorization headers using stored client JWT token.
 */
function authHeaders() {
  if (typeof window === "undefined") return {}
  const token = localStorage.getItem("hms_jwt")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Convenience hook for retrieving current authentication token and API base URL.
 */
export function useApi() {
  const { token } = useAuth()
  return { token, baseUrl: BASE }
}
