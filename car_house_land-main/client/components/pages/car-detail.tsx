"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Calendar, Star } from "lucide-react"
import { Car } from "@/types"

interface CarDetailProps {
  carId: string
}

export function CarDetail({ carId }: CarDetailProps) {
  const { cars, user, addToCart, setIsAuthModalOpen } = useApp()
  const [car, setCar] = useState<Car | null>(null)

  useEffect(() => {
    if (cars.length > 0) {
      const found = cars.find((c) => c._id === carId || c.id === carId)
      if (found) setCar(found)
    }
  }, [carId, cars])

  const contactDealer = (car: Car) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    // Placeholder for contact functionality
    alert(`Contacting dealer for ${car.title}. Feature coming soon!`)
  }

  if (!car) {
    return <div className="p-8 text-center">Loading or Car Not Found...</div>
  }

  const isSold = car.status === "sold"

  // Helper properties that might not be in Car type but are used in UI
  // Cast car to any if needed to avoid strict TS errors for missing optional properties during build
  const carAny = car as any

  const specifications = [
    { label: "Make", value: car.make },
    { label: "Model", value: car.model },
    { label: "Year", value: car.year },
    { label: "Condition", value: car.condition },
    { label: "Fuel Type", value: car.fuelType },
    { label: "Transmission", value: car.transmission },
    { label: "Mileage", value: car.mileage ? `${car.mileage} km` : "N/A" },
    { label: "Color", value: car.color },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
          {car.make} {car.model}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground mb-3 sm:mb-4">
          <div className="flex items-center">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 fill-current text-yellow-400" />
            <span className="text-sm sm:text-base">{carAny.rating || "N/A"}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="text-sm sm:text-base">
              {carAny.city}, {carAny.region}
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="text-sm sm:text-base">{car.year || "N/A"}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="text-sm sm:text-base">
              Posted: {car.createdAt ? new Date(car.createdAt).toLocaleDateString() : "N/A"}
            </span>
          </div>
        </div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-3 sm:mb-4">
          ETB {(car.price || 0).toLocaleString()}
        </div>
      </div>

      {!isSold && (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            size="lg"
            className="flex-1 text-sm sm:text-base py-2.5 sm:py-3"
            onClick={() => {
              if (user) {
                addToCart("car", car)
              } else {
                setIsAuthModalOpen(true)
              }
            }}
            disabled={!user}
          >
            Add to Cart
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 text-sm sm:text-base py-2.5 sm:py-3 bg-transparent"
            onClick={() => contactDealer(car)}
          >
            Contact Dealer
          </Button>
        </div>
      )}

      {/* Location Details */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3 sm:pb-4 bg-gray-50/50">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
            Location Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">City</span>
              <span className="text-sm sm:text-base font-semibold text-gray-900">{carAny.city || "N/A"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">Region</span>
              <span className="text-sm sm:text-base font-semibold text-gray-900">{carAny.region || "N/A"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 last:border-b-0">
              <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">Address</span>
              <span className="text-sm sm:text-base font-semibold text-gray-900 text-right sm:text-left">
                {carAny.address || "N/A"}
              </span>
            </div>
            {carAny.kebele && (
              <div className="flex flex-col sm:flex-row sm:justify-between py-2">
                <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">Kebele</span>
                <span className="text-sm sm:text-base font-semibold text-gray-900">{carAny.kebele}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3 sm:pb-4 bg-gray-50/50">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Vehicle Specifications</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specifications.map((spec, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <span className="text-sm font-medium text-gray-600 mb-1 sm:mb-0">{spec.label}</span>
                <span className="text-sm sm:text-base font-semibold text-gray-900">{spec.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3 sm:pb-4 bg-gray-50/50">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Description</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="prose prose-sm sm:prose-base max-w-none">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
              {car.description || "No description available for this vehicle."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      {carAny.features && carAny.features.length > 0 && (
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3 sm:pb-4 bg-gray-50/50">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Features</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {carAny.features.map((feature: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs sm:text-sm px-3 py-1">
                  {feature}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dealer Info */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3 sm:pb-4 bg-gray-50/50">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Dealer Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                {carAny.dealer || carAny.sellerName || "Unknown Dealer"}
              </h4>
              <p className="text-sm text-gray-600">Authorized Dealer</p>
              <div className="flex items-center text-sm text-gray-500">
                <Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
                <span>4.8 (124 reviews)</span>
              </div>
            </div>
            {!isSold && user && user.role !== "admin" && (
              <Button
                variant="outline"
                onClick={() => contactDealer(car)}
                className="text-sm sm:text-base px-6 py-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                Contact Dealer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
