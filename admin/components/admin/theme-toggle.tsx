"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(false)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = saved ? saved === "dark" : prefersDark
    setDark(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  function withSmoothThemeToggle(run: () => void) {
    const el = document.documentElement
    el.classList.add("theme-smooth")
    window.setTimeout(() => el.classList.remove("theme-smooth"), 300)
    run()
  }

  function toggle() {
    withSmoothThemeToggle(() => {
      const next = !dark
      setDark(next)
      document.documentElement.classList.toggle("dark", next)
      localStorage.setItem("theme", next ? "dark" : "light")
    })
  }

  return (
    <button
      aria-label="Toggle theme"
      className="rounded p-2 hover:bg-accent"
      onClick={toggle}
      title={dark ? "Switch to light" : "Switch to dark"}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  )
}
