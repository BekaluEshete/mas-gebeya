export interface PropertyAPIResponse {
  _id: string
  title: string
  type: "sale" | "rent"
  propertyType: "house" | "apartment" | "condo" | "villa" | "commercial" | "office" | "warehouse"
  price: number
  size: string
  bedrooms: number
  bathrooms: number
  floors?: number
  parkingSpaces?: number
  yearBuilt?: number
  features: string[]
  amenities: string[]
  description: string
  images: Array<{
    url: string
    publicId: string
    isPrimary: boolean
    room?: string
  }>
  address: string
  city: string
  region: string
  owner: string
  status: "available" | "sold" | "rented" | "pending" | "maintenance"
  views: number
  favorites: string[]
  createdAt: string
  updatedAt: string
}

import type { House } from "@/types"

import { API_BASE_URL } from "@/lib/config"

export async function fetchProperties(): Promise<House[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/properties`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: PropertyAPIResponse[] = await response.json()

    return data.map(mapPropertyToHouse)
  } catch (error) {
    console.error("Error fetching properties:", error)
    throw error
  }
}

export async function fetchPropertyById(id: string): Promise<House | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
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

    const data: PropertyAPIResponse = await response.json()
    return mapPropertyToHouse(data)
  } catch (error) {
    console.error("Error fetching property by ID:", error)
    throw error
  }
}

function mapPropertyToHouse(property: PropertyAPIResponse): House {
  const parseSize = (sizeStr: string): number => {
    if (!sizeStr || sizeStr.trim() === "") return 0
    const parsed = Number.parseFloat(sizeStr.toString().replace(/[^\d.-]/g, ""))
    return isNaN(parsed) ? 0 : Math.round(parsed)
  }

  return {
    id: property._id,
    title: property.title,
    price: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    size: parseSize(property.size),
    location: `${property.city}, ${property.region}`,
    images: property.images.map((img) => img.url),
    status: property.status as "available" | "sold" | "pending",

    description: property.description,
    featured: property.views > 100, // Consider high-view properties as featured
    createdAt: property.createdAt,
    sellerId: property.owner,
    sellerName: "Property Agent", // Default since not in API
    sellerPhone: "+251 911 123 456", // Default since not in API
    sellerEmail: "agent@properties.com", // Default since not in API
    propertyType: property.propertyType,
    listingType: property.type,
    yearBuilt: property.yearBuilt || new Date().getFullYear() - 5,
    parking: property.parkingSpaces || 1,
    floors: property.floors || 1,
    amenities: property.amenities,
    agentName: "Property Agent", // Default since not in API
    agentPhone: "+251 911 123 456", // Default since not in API
    // New location fields
    city: property.city,
    region: property.region,
    address: property.address,
  }
}

export async function deleteHouse(id: string, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/properties/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return response.ok
  } catch (error) {
    console.error("Error deleting property:", error)
    return false
  }
}
