"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Calendar,

  ArrowLeft,
  ShoppingCart,
  Heart,
  User,
  Phone,
  Mail,
  MessageCircle,
  Car as CarIcon,
  Gauge,
  Fuel,
  Settings,
  Zap,
  Palette
} from "lucide-react"
import { Car } from "@/types"
import { ImageSlider } from "@/components/ui/image-slider"

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
    return <div className="p-8 text-center text-xl font-semibold">Loading or Car Not Found...</div>
  }

  const isSold = car.status === "sold"
  const carAny = car as any

  // Map image objects to URL strings for the slider
  const imageUrls = carAny.images?.map((img: any) =>
    typeof img === 'string' ? img : img.url
  ).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <Link
          href="/cars"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Back to Cars</span>
        </Link>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">

          {/* LEFT COLUMN: Images, Specs, Description */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">

            {/* Image Gallery */}
            <Card className="overflow-hidden border-0 shadow-md">
              <CardContent className="p-0">
                <div className="aspect-[16/10] relative overflow-hidden bg-gray-100">
                  {imageUrls.length > 0 ? (
                    <ImageSlider
                      images={imageUrls}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Images Available
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 flex gap-2">
                    <Badge variant="secondary" className={`${isSold ? "bg-red-500" : "bg-green-500"} text-white text-xs sm:text-sm shadow-sm`}>
                      {car.status || "Available"}
                    </Badge>
                    {carAny.condition && (
                      <Badge variant="secondary" className="bg-blue-500 text-white text-xs sm:text-sm shadow-sm capitalize">
                        {carAny.condition}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Specifications */}
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="text-xl font-bold text-blue-800 flex items-center">
                  <CarIcon className="w-5 h-5 mr-2" />
                  Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Specs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Year</p>
                      <p className="text-base font-bold text-gray-900">{car.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Gauge className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mileage</p>
                      <p className="text-base font-bold text-gray-900">{car.mileage ? `${car.mileage} km` : "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Fuel className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fuel</p>
                      <p className="text-base font-bold text-gray-900 capitalize">{car.fuelType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Settings className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trans.</p>
                      <p className="text-base font-bold text-gray-900 capitalize">{car.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <CarIcon className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Body</p>
                      <p className="text-base font-bold text-gray-900 capitalize">{carAny.bodyType || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Palette className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Color</p>
                      <p className="text-base font-bold text-gray-900 capitalize">{car.color}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed text-base bg-gray-50 p-4 rounded-lg">
                    {car.description || "No detailed description available."}
                  </p>
                </div>

                {/* Features */}
                {carAny.features && carAny.features.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Features & Options
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {carAny.features.map((feature: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-white border-blue-300 text-blue-700 px-3 py-1">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">City:</span>
                    <span className="text-base font-semibold text-gray-900">{carAny.city || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Region:</span>
                    <span className="text-base font-semibold text-gray-900">{carAny.region || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100 md:col-span-2">
                    <span className="text-sm font-medium text-gray-600">Address:</span>
                    <span className="text-base font-semibold text-gray-900">{carAny.address || "N/A"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN: Price, Cart, Owner Info */}
          <div className="space-y-4 sm:space-y-6">

            {/* Price & Actions Card */}
            <Card className="shadow-md border-0 sticky top-4">
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-gray-700">{car.make} {car.model}</h2>
                  <div className="text-3xl font-extrabold text-blue-600">
                    ETB {(car.price || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center justify-center text-sm text-gray-500 pt-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    Posted: {car.createdAt ? new Date(car.createdAt).toLocaleDateString() : "N/A"}
                  </div>
                </div>

                {!isSold && (
                  <div className="space-y-3 pt-4">
                    <Button
                      className="w-full text-base py-6 font-semibold shadow-md bg-blue-600 hover:bg-blue-700"
                      size="lg"
                      onClick={() => user ? addToCart("car", car) : setIsAuthModalOpen(true)}
                      disabled={!user && false} // Just trigger modal if no user
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" className="w-full text-base py-6 bg-white hover:bg-gray-50">
                      <Heart className="w-5 h-5 mr-2" />
                      Save Vehicle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner/Dealer Information */}
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg font-semibold">Seller Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {carAny.dealer || carAny.sellerName || "Private Seller"}
                    </p>
                    <p className="text-sm text-gray-500">Verified Seller</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-gray-700 hover:text-blue-600 hover:border-blue-200"
                    onClick={() => contactDealer(car)}
                  >
                    <Phone className="w-4 h-4 mr-3" />
                    {carAny.sellerPhone || "Contact for Phone"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-gray-700 hover:text-blue-600 hover:border-blue-200"
                    onClick={() => contactDealer(car)}
                  >
                    <MessageCircle className="w-4 h-4 mr-3" />
                    Chat with Seller
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}

