"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ItemCard } from "@/components/ui/item-card"
import { Search, Filter, Grid, List } from "lucide-react"
import { useApp } from "@/context/app-context"
import type { Land } from "@/types"

export function LandListings() {
  const { lands, landsLoading } = useApp() // Added landsLoading from context
  const [filteredLands, setFilteredLands] = React.useState<Land[]>(lands)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showMobileFilters, setShowMobileFilters] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [filters, setFilters] = React.useState({
    listingType: "all",
    zoning: "all",
    priceRange: "all",
    sizeRange: "all",
    utilities: "all",
    sortBy: "date-new",
  })

  React.useEffect(() => {
    let filtered = [...lands]

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

    // Price range filter
    if (filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split("-").map(Number)
      filtered = filtered.filter((land) => land.price >= min && land.price <= max)
    }

    // Size range filter
    if (filters.sizeRange !== "all") {
      const [min, max] = filters.sizeRange.split("-").map(Number)
      filtered = filtered.filter((land) => land.size >= min && (max ? land.size <= max : true))
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
            className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${showMobileFilters ? "block" : "hidden md:grid"}`}
          >
            <Select value={filters.listingType} onValueChange={(value) => handleFilterChange("listingType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
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
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-100000">Under $100K</SelectItem>
                <SelectItem value="100000-250000">$100K - $250K</SelectItem>
                <SelectItem value="250000-500000">$250K - $500K</SelectItem>
                <SelectItem value="500000-999999999">Over $500K</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sizeRange} onValueChange={(value) => handleFilterChange("sizeRange", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Size (Acres)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                <SelectItem value="0-1">Under 1 Acre</SelectItem>
                <SelectItem value="1-5">1 - 5 Acres</SelectItem>
                <SelectItem value="5-10">5 - 10 Acres</SelectItem>
                <SelectItem value="10-999">Over 10 Acres</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
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
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredLands.map((land) => (
              <ItemCard key={land.id} item={land} type="land" />
            ))}
          </div>
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
