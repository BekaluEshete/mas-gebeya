import type { Land } from "@/types"

export const LANDS_DATA: Land[] = [
  {
    id: "1",
    title: "Premium Development Land",
    price: 5000000,
    size: 1000,
    location: "Lebu, Addis Ababa",
    zoning: "Residential",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center",
    ],
    status: "available",
    description: "Prime development land in growing area with excellent access and utilities.",
    listingType: "sale",
    sellerId: "seller1",
    sellerName: "Land Development Co.",
    sellerPhone: "+251911234567",
    sellerEmail: "land@example.com",
    soilType: "Sandy",
    waterAccess: true,
    roadAccess: true,
    utilities: ["Water", "Electricity"],
    developmentPotential: "High",
    featured: true,
    createdAt: new Date().toISOString()
  },
]
