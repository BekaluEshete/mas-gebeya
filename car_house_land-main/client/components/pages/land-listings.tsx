"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ItemCard } from "@/components/ui/item-card"
import { Search, Filter, Grid, List, ChevronDown } from "lucide-react"
import { useApp } from "@/context/app-context"
import type { Land } from "@/types"

export function LandListings() {
  const { lands, landsLoading, deals } = useApp() // Added landsLoading and deals from context
  const [filteredLands, setFilteredLands] = React.useState<Land[]>(lands)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showMobileFilters, setShowMobileFilters] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [visibleItems, setVisibleItems] = React.useState(6)
  const [filters, setFilters] = React.useState({
    listingType: "all",
    zoning: "all",
    priceRange: "all",
    sizeRange: "all",
    utilities: "all",
    ownershipType: "all",
    sortBy: "date-new",
  })

  React.useEffect(() => {
    // Filter to show only approved items (or all if approved field doesn't exist)
    let filtered = lands.filter((land) => land.approved !== false) // Show if approved is true or undefined

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (land) =>
          land.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          land.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          land.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Listing type filter
    if (filters.listingType !== "all") {
      filtered = filtered.filter((land) => land.listingType === filters.listingType)
    }

    // Zoning filter
    if (filters.zoning !== "all") {
      filtered = filtered.filter((land) => land.zoning === filters.zoning)
    }

    // Price range filter (high/low)
    if (filters.priceRange !== "all") {
      const allPrices = lands.map(l => l.price).sort((a, b) => a - b)
      const medianPrice = allPrices.length > 0 ? allPrices[Math.floor(allPrices.length / 2)] : 0
      if (filters.priceRange === "low") {
        filtered = filtered.filter((land) => land.price <= medianPrice)
      } else if (filters.priceRange === "high") {
        filtered = filtered.filter((land) => land.price > medianPrice)
      }
    }

    // Size range filter
    if (filters.sizeRange !== "all") {
      const [min, max] = filters.sizeRange.split("-").map(Number)
      filtered = filtered.filter((land) => land.size >= min && (max ? land.size <= max : true))
    }

    // Ownership type filter (private, lease, government, communal)
    if (filters.ownershipType !== "all") {
      filtered = filtered.filter((land) => land.ownershipType === filters.ownershipType)
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
    }

    setFilteredLands(filtered)
  }, [searchQuery, filters, lands])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Invest in Prime Land</h1>
            <p className="text-xl text-orange-100 mb-8">Discover development opportunities and agricultural land</p>

            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search land by location, title, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg bg-white text-black"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Badge variant="secondary" className="bg-orange-500 text-white">
                {lands.length} Land Plots Available
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 ${showMobileFilters ? "block" : "hidden md:grid"}`}
          >
            <Select value={filters.listingType} onValueChange={(value) => handleFilterChange("listingType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Purpose</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="lease">For Lease</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.zoning} onValueChange={(value) => handleFilterChange("zoning", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Zoning" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Zoning</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="agricultural">Agricultural</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange("priceRange", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Price Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">Low Price</SelectItem>
                <SelectItem value="high">High Price</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sizeRange} onValueChange={(value) => handleFilterChange("sizeRange", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Metre Square" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="0-4047">Under 4,047 m²</SelectItem>
                <SelectItem value="4047-20234">4,047 - 20,234 m²</SelectItem>
                <SelectItem value="20235-40469">20,235 - 40,469 m²</SelectItem>
                <SelectItem value="40470-999999">Over 40,470 m²</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.ownershipType} onValueChange={(value) => handleFilterChange("ownershipType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Ownership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ownership</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="lease">Lease</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="communal">Communal</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-new">Recent First</SelectItem>
                <SelectItem value="date-old">Oldest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {landsLoading ? "Loading..." : `Showing ${filteredLands.length} of ${lands.length} land plots`}{" "}
            {/* Added loading state */}
          </p>
        </div>

        {/* Lands Grid */}
        {landsLoading ? ( // Added loading state display
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLands.length > 0 ? (
          <>
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredLands.slice(0, visibleItems).map((land) => (
                <ItemCard key={land.id} item={land} type="land" />
              ))}
            </div>

            {/* Load More Button */}
            {visibleItems < filteredLands.length && (
              <div className="mt-12 text-center animate-fade-in">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setVisibleItems((prev) => prev + 6)}
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 font-semibold transition-all duration-300 group px-8"
                >
                  Show More Land
                  <ChevronDown className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" />
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Showing {visibleItems} of {filteredLands.length} land listings
                </p>
              </div>
            )}
          </>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">No land found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setFilters({
                      listingType: "all",
                      zoning: "all",
                      priceRange: "all",
                      sizeRange: "all",
                      utilities: "all",
                      ownershipType: "all",
                      sortBy: "date-new",
                    })
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
