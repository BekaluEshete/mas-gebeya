"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authService, type User, type AuthResponse, type RegisterData, type LoginData } from "@/lib/auth"

function SearchParamsHandler({ onAuthRequired }: { onAuthRequired: () => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("auth") === "required") {
      onAuthRequired()
    }
  }, [searchParams, onAuthRequired])

  return null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const router = useRouter()

  const checkAuth = useCallback(async () => {
    try {
      console.log("[v0] Checking authentication status...")
      setLoading(true)

      const storedUser = authService.getStoredUser()
      const hasToken = authService.isAuthenticated()

      console.log("[v0] Stored user:", storedUser ? "exists" : "none")
      console.log("[v0] Has token:", hasToken)

      if (storedUser && hasToken) {
        setUser(storedUser)
        setIsAuthenticated(true)
        console.log("[v0] Using stored user data")

        try {
          console.log("[v0] Fetching current user...")
          const currentUser = await authService.getMe()
          if (currentUser) {
            setUser(currentUser)
            setIsAuthenticated(true)
            console.log("[v0] User verified with server")
          } else {
            console.log("[v0] Server verification failed, clearing auth")
            setUser(null)
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error("[v0] Background verification failed:", error)
          // Don't clear auth on background verification failure
        }
      } else {
        console.log("[v0] No valid stored auth, clearing state")
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("[v0] Auth check error:", error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
      setInitializing(false)
    }
  }, [])

  const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
      console.log("[v0] Attempting login...")
      setLoading(true)
      const response = await authService.login(data)

      if (response.status === "success" && response.data) {
        console.log("[v0] Login successful")
        setUser(response.data.user)
        setIsAuthenticated(true)
        await new Promise((resolve) => setTimeout(resolve, 100)) // Ensure cookies are set
        const url = response.data.user.role === "admin" ? "/dashboard/admin" : "/dashboard/user"
        window.location.href = url // Force full reload
      } else {
        console.log("[v0] Login failed:", response.message)
      }
      return response
    } catch (error) {
      console.error("[v0] Login error:", error)
      return {
        status: "error",
        message: "Login failed. Please try again.",
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      setLoading(true)
      const response = await authService.register(data)
      return response
    } catch (error) {
      console.error("Registration error:", error)
      return {
        status: "error",
        message: "Registration failed. Please try again.",
      }
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (email: string, code: string): Promise<AuthResponse> => {
    try {
      setLoading(true)
      const response = await authService.verifyEmail(email, code)
      return response
    } catch (error) {
      console.error("Email verification error:", error)
      return {
        status: "error",
        message: "Email verification failed. Please try again.",
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      console.log("[v0] Logging out...")
      setUser(null)
      setIsAuthenticated(false)
      await authService.logout()
      console.log("[v0] Logout successful")
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/"
        }
      }, 1000)
    } catch (error) {
      console.error("[v0] Logout error:", error)
      setUser(null)
      setIsAuthenticated(false)
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/"
        }
      }, 1000)
    }
  }

  const forgotPassword = async (email: string): Promise<AuthResponse> => {
    try {
      setLoading(true)
      const response = await authService.forgotPassword(email)
      return response
    } catch (error) {
      console.error("Forgot password error:", error)
      return {
        status: "error",
        message: "Failed to send reset code. Please try again.",
      }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string, code: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true)
      const response = await authService.resetPassword(email, code, password)
      if (response.status === "success" && response.data) {
        setUser(response.data.user)
        setIsAuthenticated(true)
        await new Promise((resolve) => setTimeout(resolve, 100)) // Ensure cookies are set
        const url = response.data.user.role === "admin" ? "/dashboard/admin" : "/dashboard/user"
        window.location.href = url // Force full reload
      }
      return response
    } catch (error) {
      console.error("Reset password error:", error)
      return {
        status: "error",
        message: "Password reset failed. Please try again.",
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAuthRequired = useCallback(() => {
    if (!isAuthenticated) {
      console.log("[v0] Authentication required by middleware")
    }
  }, [isAuthenticated])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!initializing && isAuthenticated) {
      const interval = setInterval(() => {
        console.log("[v0] Periodic auth check...")
        checkAuth()
      }, 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [checkAuth, initializing, isAuthenticated])

  useEffect(() => {
    const checkSyncHeader = async () => {
      try {
        const response = await fetch("/auth-sync-check", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        const headers = response.headers
        if (headers.get("x-auth-sync") === "pending") {
          console.log("[v0] Auth sync pending, forcing refresh...")
          await checkAuth()
          window.location.reload() // Force refresh if sync is pending
        }
      } catch (error) {
        console.error("[v0] Auth sync check failed:", error)
      }
    }
    checkSyncHeader()
  }, [checkAuth])

  return {
    user,
    loading: loading || initializing,
    isAuthenticated,
    login,
    register,
    verifyEmail,
    logout,
    forgotPassword,
    resetPassword,
    checkAuth,
    SearchParamsHandler: () => (
      <Suspense fallback={null}>
        <SearchParamsHandler onAuthRequired={handleAuthRequired} />
      </Suspense>
    ),
  }
}