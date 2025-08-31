import type { Land } from "@/types"

export const LANDS_DATA: Land[] = [
  {
    id: "1",
    title: "Premium Development Land",
    price: 5000000,
    size: 1000,
    location: "Lebu, Addis Ababa",
    type: "development",
    zoning: "Residential",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop&crop=center",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center",
    ],
    status: "available",
    rating: 4.7,
    agent: "Land Development Co.",
    description: "Prime development land in growing area with excellent access and utilities.",
  },
]
