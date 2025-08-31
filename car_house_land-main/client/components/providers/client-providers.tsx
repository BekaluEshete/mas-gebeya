"use client"

import React, { createContext, useContext, useState } from "react"
import { authService, type LoginData, type User } from "@/lib/auth"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  login: (credentials: LoginData) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(authService.getStoredUser())
  const router = useRouter()

  const login = async (credentials: LoginData) => {
    const response = await authService.login(credentials)

    if (response.status === "success" && response.data) {
      // ✅ Update context immediately from login response
      setUser(response.data.user)

      // ✅ Redirect instantly
      if (response.data.user.role === "admin") {
        router.replace("/dashboard/admin")
      } else {
        router.replace("/dashboard/user")
      }
    } else {
      throw new Error(response.message || "Login failed")
    }
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    router.replace("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AppProvider")
  return context
}
