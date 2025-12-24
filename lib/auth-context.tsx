"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  isOnline?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  register: (email: string, password: string, name: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (googleToken: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (err) {
      console.error("Auth check failed:", err)
    } finally {
      setLoading(false)
    }
  }

  async function register(email: string, password: string, name: string) {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Registration failed")
      }

      const data = await response.json()
      setUser(data.user)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Login failed")
      }

      const data = await response.json()
      setUser(data.user)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function loginWithGoogle(googleToken: string) {
    setError(null)
    setLoading(true)
    try {
      // Decode JWT token to get user info (in production, verify on backend)
      const tokenParts = googleToken.split(".")
      const decodedToken = JSON.parse(atob(tokenParts[1]))

      const response = await fetch("/api/auth/google/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: decodedToken.sub,
          email: decodedToken.email,
          name: decodedToken.name,
          avatar: decodedToken.picture,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Google login failed")
      }

      const data = await response.json()
      setUser(data.user)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google login failed"
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        setUser(null)
      }
    } catch (err) {
      console.error("Logout failed:", err)
    } finally {
      setLoading(false)
    }
  }

  function clearError() {
    setError(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, loginWithGoogle, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
