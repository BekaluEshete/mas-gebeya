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
  Square,
  Droplets,
  Zap,
  Phone,
  Mail,
  MessageCircle,
  ShoppingCart,
  Calendar,
} from "lucide-react"
import { useApp } from "@/context/app-context"

interface LandDetailProps {
  landId: string
}

export function LandDetail({ landId }: LandDetailProps) {
  const { lands, dispatch, landsLoading } = useApp() // Added landsLoading from context
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const land = lands?.find((l) => l.id === landId || l.id === String(landId) || String(l.id) === landId)

  if (landsLoading || !lands) {
    // Updated loading condition
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!land) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Land not found</h1>
          <Link href="/lands">
            <Button className="mt-4">Back to Lands</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    dispatch({ type: "ADD_TO_CART", payload: { type: "land", item: land } })
  }

  const formatPrice = (price: number) => {
    if (land.listingType === "rent") {
      return `${(price || 0).toLocaleString()} ETB/month`
    }
    return `${(price || 0).toLocaleString()} ETB`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/lands" className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lands</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-[16/10] relative overflow-hidden rounded-t-lg">
                  <Image
                    src={land.images?.[selectedImageIndex] || "/placeholder.svg"}
                    alt={land.title || "Land"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-yellow-500 text-white">
                      {land.status || "Available"}
                    </Badge>
                  </div>
                  {land.featured && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-purple-500 text-white">
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>

                {land.images && land.images.length > 1 && (
                  <div className="p-4 flex space-x-2 overflow-x-auto">
                    {land.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                          selectedImageIndex === index ? "border-yellow-500" : "border-gray-200"
                        }`}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`${land.title || "Land"} ${index + 1}`}
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

            {/* Land Details */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200">
                <CardTitle className="text-xl font-bold text-yellow-800">Land Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Square className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Size</p>
                      <p className="text-lg font-bold text-gray-900">
                        {land.size} {land.sizeUnit || "hectares"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Zap className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Zoning</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">{land.zoning}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Droplets className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Water Access</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">{land.waterAccess}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 text-yellow-600 mr-2" />
                    Location Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">City:</span>
                      <span className="text-sm font-bold text-gray-900">{land.city}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm font-medium text-gray-600">Region:</span>
                      <span className="text-sm font-bold text-gray-900">{land.region}</span>
                    </div>
                    {land.zone && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Zone:</span>
                        <span className="text-sm font-bold text-gray-900">{land.zone}</span>
                      </div>
                    )}
                    {land.kebele && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Kebele:</span>
                        <span className="text-sm font-bold text-gray-900">{land.kebele}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed text-base bg-gray-50 p-4 rounded-lg">
                    {land.description}
                  </p>
                </div>

                {land.nearbyAmenities && land.nearbyAmenities.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">Nearby Amenities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {land.nearbyAmenities.map((amenity, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {amenity.name} ({amenity.type})
                          </span>
                          <span className="text-sm font-bold text-blue-600">{amenity.distance}km</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price and Actions */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-gray-900">{formatPrice(land.price)}</div>
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{land.rating}</span>
                    <span className="text-gray-500">({land.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{land.location}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-1 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Posted: {land.createdAt ? new Date(land.createdAt).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg" onClick={handleAddToCart}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Agent Information */}
            <Card>
              <CardHeader>
                <CardTitle>Land Agent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-yellow-600">
                      {land.sellerName
                        ? land.sellerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "NA"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{land.sellerName || "No Agent Assigned"}</p>
                    <p className="text-sm text-gray-600">Licensed Land Agent</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{land.sellerPhone || "No phone available"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{land.sellerEmail || "No email available"}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Agent
                </Button>
              </CardContent>
            </Card>

            {/* Land Features */}
            <Card>
              <CardHeader>
                <CardTitle>Land Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Listing Type</span>
                  <span className="font-medium capitalize">{land.listingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Road Access</span>
                  <span className="font-medium">{land.roadAccess ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Water Access</span>
                  <span className="font-medium">{land.waterAccess ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zoning</span>
                  <span className="font-medium capitalize">{land.zoning}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
