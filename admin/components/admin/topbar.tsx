"use client"

import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
import axios from "axios"

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  const { token, clear } = useAuth()
  console.log(token);
  
  const router = useRouter()

  async function handleLogout() {
    try {
      if (token) {
        await axios.post(
          `http://localhost:5000/api/auth/logout`,
          {}, // empty body
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      clear() // remove token + user from localStorage
      router.push("/") // redirect to login or home
    }
  }


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <button
          className="md:hidden rounded p-2 hover:bg-accent"
          onClick={onMenu}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <div className="font-medium">Admin Panel</div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  )
}
