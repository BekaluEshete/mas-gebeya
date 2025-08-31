import type { Machine } from "@/types"

const API_BASE_URL = "https://car-house-land.onrender.com/api"

// Map API response to Machine interface
function mapApiMachineToMachine(apiMachine: any): Machine {
  return {
    id: apiMachine._id,
    title: apiMachine.title,
    brand: apiMachine.brand,
    model: apiMachine.model || "",
    year: apiMachine.yearManufactured || new Date().getFullYear(),
    price: apiMachine.price,
    condition: apiMachine.condition,
    location: `${apiMachine.city}${apiMachine.region ? `, ${apiMachine.region}` : ""}`,
    city: apiMachine.city,
    region: apiMachine.region || "",
    zone: apiMachine.zone || "",
    address: apiMachine.address,
    status: apiMachine.status,
    images: apiMachine.images?.map((img: any) => img.url) || ["/placeholder-dylyj.png"],
    description: apiMachine.description,
    category: apiMachine.category,
    subcategory: apiMachine.subcategory || "",
    features: apiMachine.features || [],
    views: apiMachine.views || 0,
    favorites: apiMachine.favorites || [],
    createdAt: apiMachine.createdAt || new Date().toISOString(),
    // Default values for fields not in API
    machineType: apiMachine.category || "industrial",
    power: "",
    weight: "",
    capacity: "",
    hoursUsed: 0,
    warranty: "",
    rating: 4.5,
    reviews: Math.floor(Math.random() * 50) + 10,
    featured: false,
    listingType: "sale",
    sellerId: apiMachine.owner || "api-seller",
    sellerName: "Equipment Dealer",
    sellerPhone: "+251911234567",
    sellerEmail: "dealer@example.com",
  }
}

export async function fetchMachines(): Promise<Machine[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/machines`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Handle both array response and object with data property
    const machines = Array.isArray(data) ? data : data.machines || data.data || []

    return machines.map(mapApiMachineToMachine)
  } catch (error) {
    console.error("Error fetching machines:", error)
    return []
  }
}

export async function fetchMachineById(id: string): Promise<Machine | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/machines/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()

    // Handle both direct object and nested data
    const machine = data.machine || data.data || data

    return mapApiMachineToMachine(machine)
  } catch (error) {
    console.error("Error fetching machine:", error)
    return null
  }
}
