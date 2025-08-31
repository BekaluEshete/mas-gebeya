export interface User {
  _id: string
  fullName: string
  email: string
  phone: string
  role: "user" | "admin" | "owner"
  avatar?: string
  address?: {
    street?: string
    city?: string
    region?: string
    country?: string
  }
  isActive: boolean
  isVerified: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  status: "success" | "error"
  message: string
  data?: {
    user: User
    token: string
    refreshToken?: string
  }
}

export interface RegisterData {
  fullName: string
  email: string
  password: string
  phone: string
  address?: {
    street?: string
    city?: string
    region?: string
    country?: string
  }
}

export interface LoginData {
  email: string
  password: string
}

const API_BASE_URL = "https://car-house-land.onrender.com/api/auth"

class AuthService {
  getStoredToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("accessToken")
  }

  private getStoredRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("refreshToken")
  }

  private setTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem("accessToken", accessToken)
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken)
    }
    document.cookie = `accessToken=${encodeURIComponent(accessToken)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
    if (refreshToken) {
      document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
    }
  }

  private clearTokens(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
  }

  private setUser(user: User): void {
    if (typeof window === "undefined") return
    const userData = JSON.stringify(user)
    localStorage.setItem("user", userData)
    document.cookie = `user=${encodeURIComponent(userData)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
  }

  getStoredUser(): User | null {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("user")
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      return result
    } catch (error) {
      console.error("Registration error:", error)
      return { status: "error", message: "Registration failed. Please try again." }
    }
  }

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })
      const result = await response.json()
      return result
    } catch (error) {
      console.error("Email verification error:", error)
      return { status: "error", message: "Email verification failed. Please try again." }
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (result.status === "success" && result.data) {
        this.setTokens(result.data.token, result.data.refreshToken)
        this.setUser(result.data.user)
      }
      return result
    } catch (error) {
      console.error("Login error:", error)
      return { status: "error", message: "Login failed. Please try again." }
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getStoredRefreshToken()
      if (!refreshToken) {
        console.log("[v0] No refresh token available")
        return false
      }
      console.log("[v0] Attempting to refresh token...")
      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })
      const result = await response.json()
      console.log("[v0] Refresh token response:", result)
      if (result.status === "success" && result.data) {
        this.setTokens(result.data.token, result.data.refreshToken)
        if (result.data.user) {
          this.setUser(result.data.user)
        }
        console.log("[v0] Token refreshed successfully")
        if (typeof window !== "undefined") {
          window.location.reload()
        }
        return true
      }
      console.log("[v0] Token refresh failed:", result.message)
      return false
    } catch (error) {
      console.error("[v0] Token refresh error:", error)
      return false
    }
  }

  async getMe(): Promise<User | null> {
    try {
      const token = this.getStoredToken()
      if (!token) {
        console.log("[v0] No token available for getMe")
        return null
      }
      console.log("[v0] Fetching current user...")
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (response.status === 401) {
        console.log("[v0] Token expired, attempting refresh...")
        const refreshed = await this.refreshToken()
        if (refreshed) {
          const newToken = this.getStoredToken()
          console.log("[v0] Retrying getMe with new token...")
          const retryResponse = await fetch(`${API_BASE_URL}/me`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
          })
          const retryResult = await retryResponse.json()
          if (retryResult.status === "success" && retryResult.data) {
            this.setUser(retryResult.data.user)
            console.log("[v0] User fetched successfully after refresh")
            return retryResult.data.user
          }
        }
        console.log("[v0] Failed to refresh token, clearing auth")
        this.clearTokens()
        return null
      }
      const result = await response.json()
      if (result.status === "success" && result.data) {
        this.setUser(result.data.user)
        console.log("[v0] User fetched successfully")
        return result.data.user
      }
      console.log("[v0] Failed to fetch user:", result.message)
      return null
    } catch (error) {
      console.error("[v0] Get me error:", error)
      return null
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getStoredToken()
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      this.clearTokens()
    }
  }

  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const result = await response.json()
      return result
    } catch (error) {
      console.error("Forgot password error:", error)
      return { status: "error", message: "Failed to send reset code. Please try again." }
    }
  }

  async resetPassword(email: string, code: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      })
      const result = await response.json()
      if (result.status === "success" && result.data) {
        this.setTokens(result.data.token, result.data.refreshToken)
        this.setUser(result.data.user)
      }
      return result
    } catch (error) {
      console.error("Reset password error:", error)
      return { status: "error", message: "Password reset failed. Please try again." }
    }
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken()
  }
}

export const authService = new AuthService()