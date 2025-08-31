"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  MapPin,
  Fuel,
  Settings,
  Calendar,
  ShoppingCart,
  MessageCircle,
  Heart,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/context/app-context"

export function CarListings() {
  const {
    addToCart,
    user,
    setIsAuthModalOpen,
    soldItems,
    createDeal,
    toggleFavorite,
    isFavorite,
    cars,
    carsLoading,
    refreshCars,
  } = useApp()
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [filters, setFilters] = useState({
    condition: "all",
    make: "all",
    priceRange: "all",
    year: "all",
    fuelType: "all",
    transmission: "all",
    location: "",
    listingType: "all",
    sortBy: "date-new",
  })

  const filteredCars = cars
    .filter((car) => {
      const matchesSearch =
        (car.make?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (car.model?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (car.title?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      const matchesCondition = filters.condition === "all" || car.condition === filters.condition
      const matchesMake = filters.make === "all" || car.make === filters.make
      const matchesFuelType = filters.fuelType === "all" || car.fuelType === filters.fuelType
      const matchesTransmission = filters.transmission === "all" || car.transmission === filters.transmission
      const matchesLocation =
        !filters.location || (car.location?.toLowerCase() || "").includes(filters.location.toLowerCase())
      const matchesListingType = filters.listingType === "all" || car.listingType === filters.listingType

      return (
        matchesSearch &&
        matchesCondition &&
        matchesMake &&
        matchesFuelType &&
        matchesTransmission &&
        matchesLocation &&
        matchesListingType
      )
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "date-new":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "date-old":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "rating":
          return b.rating - a.rating
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const handleContactClick = (car: any) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    createDeal("car", car)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-responsive-3xl font-bold mb-4">Find Your Perfect Car</h1>
            <p className="text-responsive-lg text-green-100 mb-8">
              Buy or rent thousands of quality vehicles from trusted dealers
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by make, model, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg bg-white text-black"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshCars}
                disabled={carsLoading}
                className="bg-transparent"
              >
                {carsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="md:hidden bg-transparent"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showMobileFilters ? "Hide" : "Show"} Filters
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div
            className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 ${showMobileFilters ? "block" : "hidden md:grid"}`}
          >
            <Select
              value={filters.listingType}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, listingType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">For Sale & Rent</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.condition}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, condition: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.make} onValueChange={(value) => setFilters((prev) => ({ ...prev, make: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Makes</SelectItem>
                <SelectItem value="Toyota">Toyota</SelectItem>
                <SelectItem value="BMW">BMW</SelectItem>
                <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                <SelectItem value="Hyundai">Hyundai</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priceRange}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, priceRange: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-500000">Under ETB 500K</SelectItem>
                <SelectItem value="500000-1000000">ETB 500K - 1M</SelectItem>
                <SelectItem value="1000000+">Over ETB 1M</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.year} onValueChange={(value) => setFilters((prev) => ({ ...prev, year: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.fuelType}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, fuelType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Fuel Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fuel Types</SelectItem>
                <SelectItem value="Gasoline">Gasoline</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="Electric">Electric</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.transmission}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, transmission: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transmissions</SelectItem>
                <SelectItem value="Automatic">Automatic</SelectItem>
                <SelectItem value="Manual">Manual</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            />

            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-new">Newest First</SelectItem>
                <SelectItem value="date-old">Oldest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            {carsLoading ? "Loading cars..." : `Showing ${filteredCars.length} of ${cars.length} cars`}
          </p>
        </div>

        {carsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading cars...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Car Listings */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredCars.map((car) => {
                const isSold = soldItems.has(car.id)

                return (
                  <Card
                    key={car.id}
                    className={`overflow-hidden hover:shadow-lg transition-all duration-300 group ${isSold ? "opacity-60" : ""}`}
                    onClick={() => (window.location.href = `/cars/${car.id}`)}
                  >
                    <div className="relative">
                      <img
                        src={car.images[0] || "/placeholder.svg"}
                        alt={car.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant={car.listingType === "sale" ? "default" : "secondary"} className="shadow-md">
                          {car.listingType === "sale" ? "For Sale" : "For Rent"}
                        </Badge>
                        <Badge variant={car.condition === "new" ? "default" : "secondary"} className="shadow-md">
                          {car.condition}
                        </Badge>
                        {isSold && (
                          <Badge variant="destructive" className="shadow-md">
                            SOLD
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center bg-black/70 text-white px-2 py-1 rounded text-sm">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          {car.rating}
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold">{car.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {car.year} • {car.sellerName}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-600">
                            ETB {(car.price || 0).toLocaleString()}
                            {car.listingType === "rent" && (
                              <span className="text-sm font-normal text-muted-foreground">
                                {(car.price || 0) <= 5000 ? "/day" : "/month"}
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Settings className="w-4 h-4 mr-1" />
                            {(car.mileage || 0).toLocaleString()} km
                          </div>
                          <div className="flex items-center">
                            <Fuel className="w-4 h-4 mr-1" />
                            {car.fuelType}
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-1" />
                          {car.location}
                        </div>

                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          Posted: {new Date(car.createdAt).toLocaleDateString()}
                        </div>

                        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                          {!isSold && (
                            <>
                              <Button
                                onClick={() => addToCart("car", car)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={!user}
                              >
                                {car.listingType === "rent" ? (
                                  <>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Book Now
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Add to Cart
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  if (!user) {
                                    setIsAuthModalOpen(true)
                                    return
                                  }
                                  toggleFavorite("car", car)
                                }}
                                className={`shrink-0 ${isFavorite(car.id) ? "text-red-500 border-red-500" : ""}`}
                              >
                                <Heart className={`w-4 h-4 ${isFavorite(car.id) ? "fill-current" : ""}`} />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleContactClick(car)}
                                className="shrink-0"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredCars.length === 0 && !carsLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No cars found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => {
                    setSearchTerm("")
                    setFilters({
                      condition: "all",
                      make: "all",
                      priceRange: "all",
                      year: "all",
                      fuelType: "all",
                      transmission: "all",
                      location: "",
                      listingType: "all",
                      sortBy: "date-new",
                    })
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
