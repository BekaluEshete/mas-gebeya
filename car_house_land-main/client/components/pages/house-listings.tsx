"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ItemCard } from "@/components/ui/item-card"
import { Search, Grid3X3, List, Filter } from "lucide-react"
// import { houses } from "@/lib/data"
import type { House } from "@/types"
import { useApp } from "@/context/app-context"

export function HouseListings() {
  const { houses, housesLoading } = useApp()
  const [filteredHouses, setFilteredHouses] = React.useState<House[]>(houses)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = React.useState(false)
  const [filters, setFilters] = React.useState({
    listingType: "all",
    propertyType: "all",
    condition: "all",
    priceRange: "all",
    bedrooms: "all",
    bathrooms: "all",
    sortBy: "date-new",
  })

  React.useEffect(() => {
    let filtered = [...houses]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (house) =>
          (house.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (house.location?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (house.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
      )
    }

    // Listing type filter
    if (filters.listingType !== "all") {
      filtered = filtered.filter((house) => house.listingType === filters.listingType)
    }

    // Property type filter
    if (filters.propertyType !== "all") {
      filtered = filtered.filter((house) => house.propertyType === filters.propertyType)
    }

    if (filters.condition !== "all") {
      filtered = filtered.filter((house) => house.condition === filters.condition)
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split("-").map(Number)
      filtered = filtered.filter((house) => house.price >= min && house.price <= max)
    }

    // Bedrooms filter
    if (filters.bedrooms !== "all") {
      const bedrooms = Number.parseInt(filters.bedrooms)
      filtered = filtered.filter((house) => house.bedrooms >= bedrooms)
    }

    // Bathrooms filter
    if (filters.bathrooms !== "all") {
      const bathrooms = Number.parseInt(filters.bathrooms)
      filtered = filtered.filter((house) => house.bathrooms >= bathrooms)
    }

    // Sort
    switch (filters.sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "date-new":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "date-old":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
    }

    setFilteredHouses(filtered)
  }, [searchQuery, filters, houses])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight">Find Your Dream Home</h1>
            <p className="text-lg md:text-xl text-green-100 max-w-3xl mx-auto">
              Discover premium properties from trusted real estate agents across the country
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search properties by location, type, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-gray-900 bg-white rounded-lg shadow-lg border-0 text-base"
                />
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Badge variant="secondary" className="bg-green-500 text-white px-3 py-1 text-sm">
                {housesLoading ? "Loading..." : `${houses.length} Properties Available`}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white px-3 py-1 text-sm">
                Verified Listings
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="md:hidden bg-transparent"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
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
            className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 ${showFilters ? "block" : "hidden md:grid"}`}
          >
            <Select value={filters.listingType} onValueChange={(value) => handleFilterChange("listingType", value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange("propertyType", value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.condition} onValueChange={(value) => handleFilterChange("condition", value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="new">New Construction</SelectItem>
                <SelectItem value="used">Existing Property</SelectItem>
                <SelectItem value="renovated">Recently Renovated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange("priceRange", value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-500000">Under $500K</SelectItem>
                <SelectItem value="500000-1000000">$500K - $1M</SelectItem>
                <SelectItem value="1000000-2000000">$1M - $2M</SelectItem>
                <SelectItem value="2000000-999999999">Over $2M</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange("bedrooms", value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="1">1+ Bedrooms</SelectItem>
                <SelectItem value="2">2+ Bedrooms</SelectItem>
                <SelectItem value="3">3+ Bedrooms</SelectItem>
                <SelectItem value="4">4+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.bathrooms} onValueChange={(value) => handleFilterChange("bathrooms", value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Bathrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="1">1+ Bathrooms</SelectItem>
                <SelectItem value="2">2+ Bathrooms</SelectItem>
                <SelectItem value="3">3+ Bathrooms</SelectItem>
                <SelectItem value="4">4+ Bathrooms</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
              <SelectTrigger className="text-sm">
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

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {housesLoading
              ? "Loading properties..."
              : `Showing ${filteredHouses.length} of ${houses.length} properties`}
          </p>
        </div>

        {/* Houses Grid/List */}
        {housesLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600">Loading properties...</p>
            </div>
          </div>
        ) : filteredHouses.length > 0 ? (
          <div
            className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"} animate-fade-in`}
          >
            {filteredHouses.map((house, index) => (
              <div key={house.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <ItemCard item={house} type="house" viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 border-green-100 shadow-lg animate-fade-in">
            <CardContent>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">No properties found</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Try adjusting your search criteria or browse all properties
                  </p>
                </div>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white text-sm"
                  onClick={() => {
                    setSearchQuery("")
                    setFilters({
                      listingType: "all",
                      propertyType: "all",
                      condition: "all",
                      priceRange: "all",
                      bedrooms: "all",
                      bathrooms: "all",
                      sortBy: "date-new",
                    })
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
