"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "admin" | "doctor" | "dsa" | "user"

export type User = {
  role: UserRole
  roleId?: number   // 1=Admin, 2=Doctor, 3=DSA
  email: string
  name?: string
}

/** Returns true if the user has full admin access */
export function isAdmin(user: User | null): boolean {
  if (!user) return false
  return user.roleId === 1 || user.role === "admin"
}

/** Returns true if the user is a doctor */
export function isDoctor(user: User | null): boolean {
  if (!user) return false
  return user.roleId === 2 || user.role === "doctor"
}

/** Returns true if the user is a DSA */
export function isDSA(user: User | null): boolean {
  if (!user) return false
  return user.roleId === 3 || user.role === "dsa"
}

const TOKEN_KEY = "hms_jwt"
const USER_KEY = "hms_user"
const TOKEN_TS_KEY = "hms_jwt_ts"
const TOKEN_TTL_MS = 10 * 60 * 1000 // 10 minutes

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [initialized, setInitialized] = useState(false)
  const router = typeof window !== "undefined" ? useRouter() : null
  const expireTimeout = useRef<number | null>(null)

  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY)
      const u = localStorage.getItem(USER_KEY)
      const ts = localStorage.getItem(TOKEN_TS_KEY)

      if (t) setTokenState(t)

      // 🧠 Safe parse: prevent crash if "undefined" or bad JSON is stored
      if (u && u !== "undefined") {
        try {
          setUser(JSON.parse(u))
        } catch (err) {
          console.error("Invalid user JSON in localStorage — clearing:", err)
          localStorage.removeItem(USER_KEY)
        }
      }

      // If token timestamp exists, enforce TTL (10 minutes)
      if (t && ts) {
        const created = Number(ts)
        if (!Number.isFinite(created)) {
          // bad timestamp, clear token
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(TOKEN_TS_KEY)
          setTokenState(null)
          setUser(null)
        } else {
          const age = Date.now() - created
          if (age >= TOKEN_TTL_MS) {
            // expired
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(TOKEN_TS_KEY)
            localStorage.removeItem(USER_KEY)
            setTokenState(null)
            setUser(null)
            // redirect to signup/login page
            if (typeof window !== "undefined") {
              router?.push("/signup") || (window.location.href = "/signup")
            }
          } else {
            // schedule auto-expire
            const remaining = TOKEN_TTL_MS - age
            if (typeof window !== "undefined") {
              expireTimeout.current = window.setTimeout(() => {
                localStorage.removeItem(TOKEN_KEY)
                localStorage.removeItem(TOKEN_TS_KEY)
                localStorage.removeItem(USER_KEY)
                setTokenState(null)
                setUser(null)
                router?.push("/signup") || (window.location.href = "/signup")
              }, remaining) as unknown as number
            }
          }
        }
      }
    } catch (err) {
      console.error("Error loading auth from localStorage:", err)
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } finally {
      setInitialized(true)
    }
  }, [])

  function setToken(t: string, u: User) {
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    localStorage.setItem(TOKEN_TS_KEY, String(Date.now()))
    setTokenState(t)
    setUser(u)

    // clear previous timeout
    if (typeof window !== "undefined") {
      if (expireTimeout.current) {
        clearTimeout(expireTimeout.current)
      }
      // schedule expire in TOKEN_TTL_MS
      expireTimeout.current = window.setTimeout(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(TOKEN_TS_KEY)
        localStorage.removeItem(USER_KEY)
        setTokenState(null)
        setUser(null)
        router?.push("/signup") || (window.location.href = "/signup")
      }, TOKEN_TTL_MS) as unknown as number
    }
  }

  function clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_TS_KEY)
    setTokenState(null)
    setUser(null)
  }

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && expireTimeout.current) {
        clearTimeout(expireTimeout.current)
      }
    }
  }, [])

  return { token, user, initialized, setToken, clear }
}
