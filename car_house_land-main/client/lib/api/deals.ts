import { API_BASE_URL } from "../config"
import { authService } from "../auth"

export interface DealFilters {
  search?: string
  status?: "pending" | "approved" | "rejected" | "cancelled" | "completed"
  dealType?: string
  itemType?: "Car" | "Property" | "Land" | "Machine"
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export interface CreateDealData {
  item: string // MongoDB ObjectId
  itemType: "Car" | "Property" | "Land" | "Machine"
  dealType?: string
  buyer: string // MongoDB ObjectId
  seller: string // MongoDB ObjectId
  message?: string
}

export interface UpdateDealStatusData {
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed"
  cancellationReason?: string
}

// Fetch all deals (admin) or user's deals
export async function fetchDeals(filters?: DealFilters) {
  try {
    const token = authService.getStoredToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    let url = `${API_BASE_URL}/deals`

    // Build query parameters
    if (filters) {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString())
        }
      })
      if (params.toString()) {
        url += `?${params.toString()}`
      }
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.data?.deals || []
  } catch (error) {
    console.error("Error fetching deals:", error)
    return []
  }
}

// Fetch single deal by ID
export async function fetchDealById(id: string) {
  try {
    const token = authService.getStoredToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${API_BASE_URL}/deals/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.data?.deal || null
  } catch (error) {
    console.error("Error fetching deal by ID:", error)
    return null
  }
}

// Create new deal
export async function createDeal(dealData: CreateDealData) {
  try {
    const token = authService.getStoredToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    console.log("[v0] Making API request to create deal:", dealData)

    const response = await fetch(`${API_BASE_URL}/deals`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dealData),
    })

    console.log("[v0] API response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      console.error("[v0] API error response:", errorData)
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] API success response:", data)
    return data.data?.deal || null
  } catch (error) {
    console.error("[v0] Error in createDeal API call:", error)
    throw error
  }
}

// Update deal status (admin only)
export async function updateDealStatus(id: string, statusData: UpdateDealStatusData) {
  try {
    const token = authService.getStoredToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const endpoints = [
      `${API_BASE_URL}/deals/${id}`,
      `${API_BASE_URL}/deals/${id}/status`,
      `${API_BASE_URL}/deal/${id}`,
    ]

    console.log("[v0] Attempting to update deal status:", { id, statusData })

    for (const endpoint of endpoints) {
      try {
        console.log("[v0] Trying endpoint:", endpoint)

        const response = await fetch(endpoint, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(statusData),
        })

        console.log("[v0] Response for", endpoint, ":", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
        })

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Update deal status success:", data)
          return data.data?.deal || data.deal || null
        }

        // If this endpoint failed but we have more to try, continue
        if (endpoints.indexOf(endpoint) < endpoints.length - 1) {
          continue
        }

        // This was the last endpoint, handle the error
        let errorMessage = "Route not found"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`
          console.log("[v0] Error response data:", errorData)
        } catch (parseError) {
          console.log("[v0] Could not parse error response:", parseError)
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      } catch (fetchError) {
        console.log("[v0] Fetch error for", endpoint, ":", fetchError)
        // If this is not the last endpoint, try the next one
        if (endpoints.indexOf(endpoint) < endpoints.length - 1) {
          continue
        }
        // This was the last endpoint, throw the error
        throw fetchError
      }
    }
  } catch (error) {
    console.error("[v0] Error updating deal status:", error)
    throw error
  }
}

// Delete deal (admin only)
export async function deleteDeal(id: string) {
  try {
    const token = authService.getStoredToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${API_BASE_URL}/deals/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return response.ok
  } catch (error) {
    console.error("Error deleting deal:", error)
    return false
  }
}

// Get deal statistics (admin only)
export async function fetchDealStats() {
  try {
    const token = authService.getStoredToken()
    if (!token) {
      throw new Error("Authentication required")
    }

    const response = await fetch(`${API_BASE_URL}/deals/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.data || {}
  } catch (error) {
    console.error("Error fetching deal stats:", error)
    return {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0,
    }
  }
}
