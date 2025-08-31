"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, ShoppingCart, MessageCircle, Heart, Calendar } from "lucide-react"
import { useApp } from "@/context/app-context"
import type { Car, House, Land, Machine } from "@/types"
import { cn } from "@/lib/utils"

interface ItemCardProps {
  item: Car | House | Land | Machine
  type: "car" | "house" | "land" | "machine"
  className?: string
}

export function ItemCard({ item, type, className }: ItemCardProps) {
  const { addToCart, toggleFavorite, isFavorite, user, setIsAuthModalOpen, createDeal } = useApp()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    addToCart(type, item)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    toggleFavorite(type, item)
  }

  const handleContactSeller = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    console.log("[v0] Contact seller clicked for item:", item.id)
    const message = `ሰላም፣ በ${item.title} ላይ ፍላጎት አለኝ። እባክዎ ተጨማሪ መረጃ ይስጡኝ?`

    createDeal(type, item, message)
      .then(() => {
        console.log("[v0] Deal created successfully, redirecting to deals page")
        window.location.href = "/deals"
      })
      .catch((error) => {
        console.error("[v0] Error creating deal:", error)
        // Still redirect even if there's an error, as we have local fallback
        window.location.href = "/deals"
      })
  }

  const isItemFavorite = isFavorite(item.id)

  const getCategoryColor = (type: string) => {
    switch (type) {
      case "car":
        return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800"
      case "house":
        return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800"
      case "land":
        return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800"
      case "machine":
        return "text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-800"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500 hover:bg-green-600"
      case "sold":
        return "bg-red-500 hover:bg-red-600"
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const formatPrice = (price: number) => {
    const safePrice = price || 0
    const isRental = isRentalItem()
    if (isRental) {
      if (type === "machine") {
        return safePrice <= 5000 ? `${safePrice.toLocaleString()} ብር/ቀን` : `${safePrice.toLocaleString()} ብር/ወር`
      }
      if (type === "house" && "listingType" in item && item.listingType === "rent") {
        return `${safePrice.toLocaleString()} ብር/ወር`
      }
      if (type === "car" && "listingType" in item && item.listingType === "rent") {
        return safePrice <= 5000 ? `${safePrice.toLocaleString()} ብር/ቀን` : `${safePrice.toLocaleString()} ብር/ወር`
      }
    }
    return `${safePrice.toLocaleString()} ብር`
  }

  const getItemDetails = () => {
    switch (type) {
      case "car":
        const car = item as Car
        return `${car.year || "N/A"} • ${(car.mileage || 0).toLocaleString()} miles • ${car.fuelType || "N/A"}`
      case "house":
        const house = item as House
        return `${house.bedrooms || 0} bed • ${house.bathrooms || 0} bath • ${(house.size || 0).toLocaleString()} sq ft`
      case "land":
        const land = item as Land
        return `${land.size || "N/A"} acres • ${land.zoning || "N/A"} • ${land.listingType || "N/A"}`
      case "machine":
        const machine = item as Machine
        return `${machine.year || "N/A"} • ${(machine.hoursUsed || 0).toLocaleString()} hrs • ${machine.condition || "N/A"}`
      default:
        return ""
    }
  }

  const isRentalItem = () => {
    if (type === "car" && "listingType" in item) {
      return item.listingType === "rent"
    }
    if (type === "house" && "listingType" in item) {
      return item.listingType === "rent"
    }
    if (type === "land" && "listingType" in item) {
      return item.listingType === "rent" || item.listingType === "lease"
    }
    if (type === "machine") {
      // For machines, determine rental based on price and title
      return (
        item.price < 50000 || item.title.toLowerCase().includes("rental") || item.title.toLowerCase().includes("rent")
      )
    }
    return false
  }

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md animate-fade-in bg-white/90 backdrop-blur-sm hover:bg-white/95 w-full max-w-sm mx-auto sm:max-w-none",
        className,
      )}
    >
      <Link href={`/${type}s/${item.id}`}>
        <div className="relative overflow-hidden">
          <div className="aspect-[4/3] sm:aspect-[3/2] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <Image
              src={item.images[0] || "/placeholder.svg?height=200&width=300&query=modern property"}
              alt={item.title}
              width={300}
              height={200}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Status badge */}
          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 animate-slide-in-left">
            <Badge
              variant="secondary"
              className={cn(
                "text-white border-0 shadow-md backdrop-blur-sm transition-all duration-300 font-medium text-xs px-1.5 py-0.5 sm:px-2 sm:py-1",
                getStatusColor(item.status),
              )}
            >
              {item.status}
            </Badge>
          </div>

          {/* Featured badge */}
          {item.featured && (
            <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 animate-slide-in-right">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-md backdrop-blur-sm transition-all duration-300 font-medium text-xs animate-pulse px-1.5 py-0.5 sm:px-2 sm:py-1"
              >
                <span className="hidden sm:inline">⭐ Featured</span>
                <span className="sm:hidden">⭐</span>
              </Badge>
            </div>
          )}

          {/* Rental/Sale badge */}
          {isRentalItem() && (
            <div className="absolute top-1.5 sm:top-2 left-12 sm:left-16 animate-slide-in-left">
              <Badge
                variant="secondary"
                className="bg-purple-500 text-white border-0 shadow-md backdrop-blur-sm transition-all duration-300 font-medium text-xs px-1.5 py-0.5 sm:px-2 sm:py-1"
              >
                <span className="hidden sm:inline">For Rent</span>
                <span className="sm:hidden">Rent</span>
              </Badge>
            </div>
          )}

          {/* Category badge */}
          <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 animate-slide-in-bottom">
            <Badge
              variant="outline"
              className={cn(
                "font-medium capitalize backdrop-blur-sm shadow-md transition-all duration-300 border text-xs px-1.5 py-0.5 sm:px-2 sm:py-1",
                getCategoryColor(type),
              )}
            >
              {type}
            </Badge>
          </div>

          {/* Favorite button overlay */}
          <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleFavorite}
              className={cn(
                "rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0 shadow-md backdrop-blur-sm transition-all duration-300",
                isItemFavorite
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-white/90 hover:bg-white text-gray-700 hover:text-red-500",
              )}
              disabled={!user}
            >
              <Heart className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3", isItemFavorite && "fill-current")} />
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <Link href={`/${type}s/${item.id}`}>
          <div className="space-y-2 sm:space-y-3">
            {/* Title and Price */}
            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base md:text-lg line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                {item.title}
              </h3>
              <p className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                {formatPrice(item.price)}
              </p>
            </div>

            {/* Details */}
            <p className="text-xs sm:text-sm text-muted-foreground font-medium bg-gray-50 dark:bg-gray-800 rounded-lg px-2 py-1 line-clamp-1">
              {getItemDetails()}
            </p>

            {/* Location and Rating */}
            <div className="flex items-center justify-between text-xs gap-2">
              <div className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors duration-300 min-w-0 flex-1">
                <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                <span className="line-clamp-1 font-medium text-xs sm:text-sm">{item.location}</span>
              </div>
              <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 px-1.5 sm:px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-800 flex-shrink-0">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-yellow-700 dark:text-yellow-300 text-xs">{item.rating}</span>
                <span className="text-yellow-600 dark:text-yellow-400 text-xs hidden sm:inline">({item.reviews})</span>
              </div>
            </div>

            {/* Posted date display */}
            <div className="flex items-center space-x-1 text-muted-foreground text-xs">
              <Calendar className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="font-medium">Posted: {new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-border/50">
          <Button
            size="sm"
            className="flex-1 transition-all duration-300 shadow-sm hover:shadow-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3"
            onClick={handleAddToCart}
            disabled={!user}
          >
            {isRentalItem() ? (
              <>
                <Calendar className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Book Now</span>
                <span className="sm:hidden">Book</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Add</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="transition-all duration-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 bg-transparent border p-1.5 sm:p-2"
            onClick={handleContactSeller}
            disabled={!user}
          >
            <MessageCircle className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFavorite}
            className={cn(
              "transition-all duration-300 bg-transparent border p-1.5 sm:p-2",
              isItemFavorite
                ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                : "hover:bg-red-50 hover:border-red-300 hover:text-red-600",
            )}
            disabled={!user}
          >
            <Heart className={cn("w-3 h-3", isItemFavorite && "fill-current")} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
