"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth-form"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        })

        const googleButton = document.getElementById("google-signin-button")
        if (googleButton) {
          window.google.accounts.id.renderButton(googleButton, {
            theme: "outline",
            size: "large",
            width: "100%",
          })
        }
      }
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handleGoogleCallback = (response: any) => {
    // Pass to AuthForm via event or context
    const event = new CustomEvent("googleSignIn", { detail: response })
    window.dispatchEvent(event)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">ChatHub</h1>
        <p className="text-muted-foreground mt-2">Real-time messaging made simple</p>
      </div>

      <AuthForm mode={mode} onSwitchMode={() => setMode(mode === "login" ? "register" : "login")} />
    </div>
  )
}
