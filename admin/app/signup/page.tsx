"use client"

import Image from "next/image"
import { AuthCardSimple } from "@/components/auth/auth-card-simple"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SignupPage() {
  const { token, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (initialized && token) {
      router.replace("/admin")
    }
  }, [initialized, token, router])

  if (!initialized) {
    return null
  }

  return (
    <main className="relative min-h-dvh">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/medical-hero.jpg"
          alt="Modern hospital corridor background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 flex min-h-dvh items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthCardSimple />
        </div>
      </div>
    </main>
  )
}
