import type { House } from "@/types"
import { API_BASE_URL } from "../config"

export interface HouseFilters {
  bedrooms?: number
  bathrooms?: number
  minPrice?: number
  maxPrice?: number
  propertyType?: string
  minSize?: number
  maxSize?: number
  yearBuilt?: number
  city?: string
  region?: string
  status?: "available" | "sold" | "rented" | "pending" | "maintenance"
  page?: number
  limit?: number
  sort?: string
}

export async function fetchHouses(filters?: HouseFilters): Promise<House[]> {
  try {
    let url = `${API_BASE_URL}/houses`

    // Build query parameters from filters
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
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Handle different response structures
    const houses = Array.isArray(data) ? data : data.houses || data.data || []

    return houses
  } catch (error) {
    console.error("Error fetching houses:", error)
    return []
  }
}

export async function fetchHouseById(id: string): Promise<House | null> {
  try {
    if (!id || id.trim() === "") {
      console.error("Invalid house ID: empty or undefined")
      return null
    }

    const response = await fetch(`${API_BASE_URL}/houses/${id.trim()}`, {
      method: "GET",
      headers: {
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
    const house = data.house || data.data || data

    if (!house) {
      return null
    }

    return house
  } catch (error) {
    console.error("Error fetching house by ID:", error)
    return null
  }
}

export async function addHouse(houseData: FormData, token: string): Promise<House | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/houses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: houseData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const house = data.house || data.data || data

    return house
  } catch (error) {
    console.error("Error creating house:", error)
    return null
  }
}

export async function updateHouse(id: string, houseData: FormData, token: string): Promise<House | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/houses/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: houseData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const house = data.house || data.data || data

    return house
  } catch (error) {
    console.error("Error updating house:", error)
    return null
  }
}

export async function deleteHouse(id: string, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/houses/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return response.ok
  } catch (error) {
    console.error("Error deleting house:", error)
    return false
  }
}
