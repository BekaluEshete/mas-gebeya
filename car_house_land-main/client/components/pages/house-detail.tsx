"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Star,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  Heart,
  ShoppingCart,
} from "lucide-react"
import { useApp } from "@/context/app-context"

interface HouseDetailProps {
  houseId: string
}

export function HouseDetail({ houseId }: HouseDetailProps) {
  const { houses, housesLoading, dispatch } = useApp()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (housesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Loading property...</h1>
        </div>
      </div>
    )
  }

  if (!houses) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    )
  }

  const house = houses.find((h) => h.id === houseId || h.id === String(houseId) || String(h.id) === houseId)

  if (!house) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Property not found</h1>
          <Link href="/houses">
            <Button className="mt-4 text-sm sm:text-base">Back to Properties</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    dispatch({ type: "ADD_TO_CART", payload: { type: "house", item: house } })
  }

  const formatPrice = (price: number) => {
    if (house.listingType === "rent") {
      return `${(price || 0).toLocaleString()} ETB/month`
    }
    return `${(price || 0).toLocaleString()} ETB`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <Link
          href="/houses"
          className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>Back to Properties</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Images and Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-[16/10] relative overflow-hidden rounded-t-lg">
                  <Image
                    src={house.images?.[selectedImageIndex] || "/placeholder.svg"}
                    alt={house.title || "House"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                    <Badge variant="secondary" className="bg-green-500 text-white text-xs sm:text-sm">
                      {house.status || "Available"}
                    </Badge>
                  </div>
                  {house.featured && (
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                      <Badge variant="secondary" className="bg-purple-500 text-white text-xs sm:text-sm">
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>

                {house.images && house.images.length > 1 && (
                  <div className="p-2 sm:p-4 flex space-x-1.5 sm:space-x-2 overflow-x-auto">
                    {house.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden border-2 ${
                          selectedImageIndex === index ? "border-green-500" : "border-gray-200"
                        }`}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${house.title || "House"} ${index + 1}`}
                          width={80}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <CardTitle className="text-xl font-bold text-green-800">Property Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Bed className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Bedrooms</p>
                      <p className="text-lg font-bold text-gray-900">{house.bedrooms || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Bath className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Bathrooms</p>
                      <p className="text-lg font-bold text-gray-900">{house.bathrooms || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Square className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Size</p>
                      <p className="text-lg font-bold text-gray-900">{house.size || "N/A"} sq ft</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Built</p>
                      <p className="text-lg font-bold text-gray-900">{house.yearBuilt || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed text-base bg-gray-50 p-4 rounded-lg">
                    {house.description || "No description available"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 text-green-600 mr-2" />
                    Location Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">City:</span>
                      <span className="text-sm font-bold text-gray-900">{house.city}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Region:</span>
                      <span className="text-sm font-bold text-gray-900">{house.region}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Address:</span>
                      <span className="text-sm font-bold text-gray-900">{house.address}</span>
                    </div>
                  </div>
                </div>

                {house.amenities && house.amenities.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {house.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="bg-white border-blue-300 text-blue-700">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {house.features && house.features.length > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-lg font-bold text-green-800 mb-3">Property Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {house.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="bg-white border-green-300 text-green-700">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Price and Actions */}
            <Card>
              <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{formatPrice(house.price)}</div>
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-sm sm:text-base">{house.rating}</span>
                    <span className="text-gray-500 text-xs sm:text-sm">({house.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1 text-gray-600">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-sm sm:text-base">
                      {house.city}, {house.region}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-1 text-gray-600">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-sm sm:text-base">
                      Posted: {house.createdAt ? new Date(house.createdAt).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <Button className="w-full text-sm sm:text-base py-2.5 sm:py-3" size="lg" onClick={handleAddToCart}>
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent text-sm sm:text-base py-2.5 sm:py-3">
                    <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Save Property
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Agent Information */}
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Real Estate Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-green-600 text-sm sm:text-base">
                      {house.agentName
                        ? house.agentName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "NA"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{house.agentName || "No Agent Assigned"}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Licensed Real Estate Agent</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-xs sm:text-sm">{house.agentPhone || "No phone available"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-xs sm:text-sm">{house.sellerEmail || "No email available"}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent text-sm sm:text-base">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Contact Agent
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
