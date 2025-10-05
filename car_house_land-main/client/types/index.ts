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

export interface LegacyUser {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  avatar?: string
}

export interface CartItem {
  cartId: number
  id: string
  title?: string
  make?: string
  model?: string
  price: number
  image: string
  quantity: number
  category: "car" | "house" | "land" | "machine"
}

export interface Deal {
  _id: string
  id: string // For compatibility with existing code
  dealId?: string // Auto-generated deal ID from backend

  // Buyer and Seller
  buyer: {
    _id: string
    fullName: string
    email: string
    phone?: string
  }
  seller: {
    _id: string
    fullName: string
    email: string
    phone?: string
  }

  // Item being sold or rented
  item: {
    _id: string
    title: string
    price: number
    images: string[]
    description?: string
    location?: string
  }
  itemType: "Car" | "Property" | "Land" | "Machine"

  // Deal details
  dealType?: string
  message?: string
  userMessage?: string // For backward compatibility
  originalPrice: number
  userOfferPrice?: number

  // Status and timestamps
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed"
  createdAt: string
  updatedAt: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string

  // Legacy fields for compatibility
  itemId: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
  chatHistory: ChatMessage[]
  adminInfo: {
    name: string
    email: string
    phone: string
    telegram?: string
    whatsapp?: string
  }
}

export interface ChatMessage {
  id: string
  sender: "user" | "admin"
  message: string
  timestamp: string
}

export interface Car {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuelType: string
  transmission: string
  condition: "new" | "used"
  location: string
  city: string
  region: string
  address: string
  kebele?: string
  images: string[]
  status: "available" | "sold" | "pending"
  rating: number
  reviews: number
  description: string
  featured: boolean
  createdAt: string
  sellerId: string
  sellerName: string
  sellerPhone: string
  sellerEmail: string
  bodyType: string
  color: string
  engine: string
  listingType: "sale" | "rent"
}

export interface House {
  id: string
  title: string
  price: number
  bedrooms: number
  bathrooms: number
  size: number
  location: string
  city: string
  region: string
  address: string
  images: string[]
  status: "available" | "sold" | "pending"
  rating: number
  reviews: number
  description: string
  featured: boolean
  createdAt: string
  sellerId: string
  sellerName: string
  sellerPhone: string
  sellerEmail: string
  propertyType: string
  listingType: "sale" | "rent"
  yearBuilt: number
  parking: number
  amenities: string[]
  agentName: string
  agentPhone: string
}

export interface Land {
  id: string
  title: string
  price: number
  size: number
  sizeUnit?: "hectare" | "acre" | "sqm" // Added size unit field
  location: string
  city: string // Added city field
  region: string // Added region field
  zone?: string // Added zone field
  kebele?: string // Added kebele field
  images: string[]
  status: "available" | "sold" | "pending" | "reserved" // Added reserved status
  rating: number
  reviews: number
  description: string
  featured: boolean
  createdAt: string
  sellerId: string
  sellerName: string
  sellerPhone: string
  sellerEmail: string
  zoning: string
  landUse?: string // Added land use field
  topography?: string // Added topography field
  listingType: "sale" | "rent" | "lease"
  soilType: string
  waterAccess: boolean
  roadAccess: boolean
  utilities: string[]
  developmentPotential: string
  nearbyAmenities?: Array<{
    // Added nearby amenities field
    name: string
    distance: number
    type: string
  }>
}

export interface Machine {
  id: string
  title: string
  brand: string
  model: string
  year: number
  price: number
  condition: "new" | "used" | "refurbished"
  location: string
  city: string
  region?: string
  zone?: string
  address: string
  images: string[]
  status: "available" | "sold" | "pending"
  rating: number
  reviews: number
  description: string
  featured: boolean
  createdAt: string
  sellerId: string
  sellerName: string
  sellerPhone: string
  sellerEmail: string
  machineType: string
  power: string
  weight: number
  capacity: string
  hoursUsed: number
  warranty: string
  listingType: "sale" | "rent" | "lease"
  category: string
  subcategory?: string
  yearManufactured?: number
  features: string[]
  views: number
  favorites: string[]
}
// lib/types.ts
export interface Consultation {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  category: 'Car' | 'Land' | 'Machinery' | 'Property' | 'Business';
  description: string;
  type: 'Car' | 'Land' | 'Machinery' | 'Property' | 'Business';
  mode: 'Online video call' | 'Phone call' | 'In-person';
  dateTime: string; // ISO string, e.g., "2025-10-10T14:00:00Z"
  status: 'pending' | 'accepted' | 'rescheduled' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
  agentNotes?: string; // For admin updates
}