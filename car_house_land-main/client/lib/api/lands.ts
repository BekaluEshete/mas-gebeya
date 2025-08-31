import type { Land } from "@/types" // Fixed import to use correct path for Land interface

export interface APILand {
  _id: string
  title: string
  price: number
  size: {
    value: number
    unit: "hectare" | "acre" | "sqm"
  }
  zoning: "residential" | "commercial" | "industrial" | "agricultural" | "recreational" | "mixed"
  landUse: "development" | "farming" | "commercial" | "recreation" | "vineyard" | "mining" | "tourism" | "technology"
  topography: "flat" | "hilly" | "mountainous" | "rolling" | "desert" | "sloped"
  waterAccess: "none" | "well" | "river" | "lake" | "municipal" | "borehole"
  roadAccess: "paved" | "gravel" | "dirt" | "none"
  utilities: {
    electricity: boolean
    water: boolean
    sewer: boolean
    gas: boolean
    internet: boolean
  }
  description: string
  images: Array<{
    url: string
    publicId: string
    isPrimary: boolean
    description?: string
  }>
  city: string
  region: string
  zone?: string
  kebele?: string
  owner: string
  status: "available" | "sold" | "pending" | "reserved"
  views: number
  favorites: string[]
  nearbyAmenities: Array<{
    name: string
    distance: number
    type: "school" | "hospital" | "market" | "transport" | "religious" | "government"
  }>
  createdAt: string
  updatedAt: string
}

export async function fetchLands(): Promise<Land[]> {
  try {
    const response = await fetch("https://car-house-land.onrender.com/api/lands")
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Map API response to our Land interface
    return data.map((apiLand: APILand) => ({
      id: apiLand._id,
      title: apiLand.title,
      price: apiLand.price,
      size: apiLand.size.value, // Convert to number for compatibility
      sizeUnit: apiLand.size.unit,
      location: `${apiLand.city}, ${apiLand.region}`,
      city: apiLand.city,
      region: apiLand.region,
      zone: apiLand.zone,
      kebele: apiLand.kebele,
      images: apiLand.images.map((img) => img.url),
      status: apiLand.status,
      rating: 4.5, // Default rating since not in API
      reviews: Math.floor(Math.random() * 50) + 10, // Random reviews for now
      description: apiLand.description,
      featured: Math.random() > 0.7, // Random featured status
      createdAt: apiLand.createdAt,
      sellerId: apiLand.owner,
      sellerName: "Land Agent", // Default seller name
      sellerPhone: "+251 911 123 456", // Default phone
      sellerEmail: "agent@example.com", // Default email
      zoning: apiLand.zoning,
      landUse: apiLand.landUse,
      topography: apiLand.topography,
      listingType: "sale" as const, // Default to sale
      soilType: "Fertile", // Default soil type
      waterAccess: apiLand.waterAccess !== "none",
      roadAccess: apiLand.roadAccess !== "none",
      utilities: Object.entries(apiLand.utilities)
        .filter(([_, value]) => value)
        .map(([key, _]) => key),
      developmentPotential: "High potential for development",
      nearbyAmenities: apiLand.nearbyAmenities,
    }))
  } catch (error) {
    console.error("Error fetching lands:", error)
    return []
  }
}

export async function fetchLandById(id: string): Promise<Land | null> {
  try {
    const response = await fetch(`https://car-house-land.onrender.com/api/lands/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const apiLand: APILand = await response.json()

    // Map API response to our Land interface
    return {
      id: apiLand._id,
      title: apiLand.title,
      price: apiLand.price,
      size: apiLand.size.value,
      sizeUnit: apiLand.size.unit,
      location: `${apiLand.city}, ${apiLand.region}`,
      city: apiLand.city,
      region: apiLand.region,
      zone: apiLand.zone,
      kebele: apiLand.kebele,
      images: apiLand.images.map((img) => img.url),
      status: apiLand.status,
      rating: 4.5,
      reviews: Math.floor(Math.random() * 50) + 10,
      description: apiLand.description,
      featured: Math.random() > 0.7,
      createdAt: apiLand.createdAt,
      sellerId: apiLand.owner,
      sellerName: "Land Agent",
      sellerPhone: "+251 911 123 456",
      sellerEmail: "agent@example.com",
      zoning: apiLand.zoning,
      landUse: apiLand.landUse,
      topography: apiLand.topography,
      listingType: "sale" as const,
      soilType: "Fertile",
      waterAccess: apiLand.waterAccess !== "none",
      roadAccess: apiLand.roadAccess !== "none",
      utilities: Object.entries(apiLand.utilities)
        .filter(([_, value]) => value)
        .map(([key, _]) => key),
      developmentPotential: "High potential for development",
      nearbyAmenities: apiLand.nearbyAmenities,
    }
  } catch (error) {
    console.error("Error fetching land by ID:", error)
    return null
  }
}
