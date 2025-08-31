import type { Car } from "@/types"
import { API_BASE_URL } from "../config"
import { mapApiCarToLocal } from "../utils/mappers"

export interface CarFilters {
  make?: string
  model?: string
  year?: number
  minYear?: number
  maxYear?: number
  type?: "sale" | "rent"
  condition?: "new" | "used"
  minPrice?: number
  maxPrice?: number
  fuelType?: "gasoline" | "diesel" | "hybrid" | "electric"
  transmission?: "manual" | "automatic"
  bodyType?: "sedan" | "suv" | "hatchback" | "coupe" | "pickup" | "van" | "convertible"
  color?: string
  city?: string
  region?: string
  status?: "available" | "sold" | "rented" | "pending" | "maintenance"
  page?: number
  limit?: number
  sort?: string
}

export async function fetchCars(filters?: CarFilters): Promise<Car[]> {
  try {
    let url = `${API_BASE_URL}/cars`

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
    const cars = Array.isArray(data) ? data : data.cars || data.data || []

    return cars.map(mapApiCarToLocal)
  } catch (error) {
    console.error("Error fetching cars:", error)
    // Return empty array on error to prevent app crash
    return []
  }
}

export async function fetchCarById(id: string): Promise<Car | null> {
  try {
    console.log("[v0] Fetching car with ID:", id)

    if (!id || id.trim() === "") {
      console.error("[v0] Invalid car ID: empty or undefined")
      return null
    }

    // Validate MongoDB ObjectId format (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/
    if (!objectIdRegex.test(id.trim())) {
      console.error("[v0] Invalid car ID format:", id, "Expected 24 character hex string")
      return null
    }

    const response = await fetch(`${API_BASE_URL}/cars/${id.trim()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("[v0] API Response status:", response.status)

    if (!response.ok) {
      if (response.status === 404) {
        console.log("[v0] Car not found (404)")
        return null
      }

      const errorText = await response.text()
      console.error("[v0] API Error Response:", errorText)
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] API Response data:", data)

    // Handle different response structures
    const car = data.car || data.data || data

    if (!car) {
      console.error("[v0] No car data in response:", data)
      return null
    }

    return mapApiCarToLocal(car)
  } catch (error) {
    console.error("[v0] Error fetching car by ID:", error)
    return null
  }
}

export async function fetchCarStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/cars/car/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching car stats:", error)
    return {
      total: 0,
      available: 0,
      sold: 0,
      rented: 0,
      pending: 0,
    }
  }
}

export async function createCar(carData: FormData, token: string): Promise<Car | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/cars`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: carData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const car = data.car || data.data || data

    return mapApiCarToLocal(car)
  } catch (error) {
    console.error("Error creating car:", error)
    return null
  }
}

export async function updateCar(id: string, carData: FormData, token: string): Promise<Car | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: carData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const car = data.car || data.data || data

    return mapApiCarToLocal(car)
  } catch (error) {
    console.error("Error updating car:", error)
    return null
  }
}

export async function deleteCar(id: string, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return response.ok
  } catch (error) {
    console.error("Error deleting car:", error)
    return false
  }
}
