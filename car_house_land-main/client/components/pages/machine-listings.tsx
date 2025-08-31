"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ItemCard } from "@/components/ui/item-card"
import { Search, Grid3X3, List, Filter } from "lucide-react"
// import { MACHINES_DATA } from "@/lib/data/machines"
import type { Machine } from "@/types"
import { useApp } from "@/context/app-context"

export function MachineListings() {
  const { machines, machinesLoading } = useApp()
  const [filteredMachines, setFilteredMachines] = React.useState<Machine[]>(machines)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = React.useState(false)
  const [filters, setFilters] = React.useState({
    listingType: "all",
    condition: "all",
    machineType: "all",
    brand: "all",
    priceRange: "all",
    yearRange: "all",
    sortBy: "date-new",
  })

  React.useEffect(() => {
    let filtered = [...machines]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (machine) =>
          (machine.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (machine.brand?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (machine.model?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (machine.location?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (machine.category?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (machine.subcategory?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
      )
    }

    if (filters.listingType !== "all") {
      filtered = filtered.filter((machine) => {
        // Determine listing type from price and title
        const isRental =
          machine.price < 50000 ||
          (machine.title?.toLowerCase() || "").includes("rental") ||
          (machine.title?.toLowerCase() || "").includes("rent")
        const listingType = isRental ? "rent" : "sale"
        return listingType === filters.listingType
      })
    }

    // Condition filter
    if (filters.condition !== "all") {
      filtered = filtered.filter((machine) => machine.condition === filters.condition)
    }

    // Machine type filter
    if (filters.machineType !== "all") {
      filtered = filtered.filter(
        (machine) => machine.category === filters.machineType || machine.machineType === filters.machineType,
      )
    }

    // Brand filter
    if (filters.brand !== "all") {
      filtered = filtered.filter((machine) => (machine.brand?.toLowerCase() || "") === filters.brand)
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split("-").map(Number)
      filtered = filtered.filter((machine) => machine.price >= min && machine.price <= max)
    }

    // Year range filter
    if (filters.yearRange !== "all") {
      const [min, max] = filters.yearRange.split("-").map(Number)
      filtered = filtered.filter((machine) => machine.year >= min && (max ? machine.year <= max : true))
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

    setFilteredMachines(filtered)
  }, [searchQuery, filters, machines])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">Heavy Equipment & Machinery</h1>
            <p className="text-lg text-green-100 max-w-3xl mx-auto">
              Buy or rent industrial equipment and machinery for your business needs
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search machines by brand, model, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-gray-900 bg-white rounded-lg shadow-lg border-0 text-base"
                />
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Badge variant="secondary" className="bg-green-500 text-white px-3 py-1 text-sm">
                {machinesLoading ? "Loading..." : `${machines.length} Machines Available`}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white px-3 py-1 text-sm">
                Certified Equipment
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
                <SelectItem value="all">For Sale & Rent</SelectItem>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.condition} onValueChange={(value) => handleFilterChange("condition", value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="refurbished">Refurbished</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.machineType} onValueChange={(value) => handleFilterChange("machineType", value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Machine Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="excavator">Excavator</SelectItem>
                <SelectItem value="bulldozer">Bulldozer</SelectItem>
                <SelectItem value="crane">Crane</SelectItem>
                <SelectItem value="forklift">Forklift</SelectItem>
                <SelectItem value="generator">Generator</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.brand} onValueChange={(value) => handleFilterChange("brand", value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="caterpillar">Caterpillar</SelectItem>
                <SelectItem value="john deere">John Deere</SelectItem>
                <SelectItem value="komatsu">Komatsu</SelectItem>
                <SelectItem value="volvo">Volvo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange("priceRange", value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-1250000">Under ETB 1.25M</SelectItem>
                <SelectItem value="1250000-2500000">ETB 1.25M - 2.5M</SelectItem>
                <SelectItem value="2500000-5000000">ETB 2.5M - 5M</SelectItem>
                <SelectItem value="5000000-999999999">Over ETB 5M</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.yearRange} onValueChange={(value) => handleFilterChange("yearRange", value)}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Year Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2020-2024">2020-2024</SelectItem>
                <SelectItem value="2015-2019">2015-2019</SelectItem>
                <SelectItem value="2010-2014">2010-2014</SelectItem>
                <SelectItem value="2000-2009">2000-2009</SelectItem>
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
            {machinesLoading
              ? "Loading machines..."
              : `Showing ${filteredMachines.length} of ${machines.length} machines`}
          </p>
        </div>

        {/* Machines Grid/List */}
        {machinesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMachines.length > 0 ? (
          <div
            className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}`}
          >
            {filteredMachines.map((machine, index) => (
              <div key={machine.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <ItemCard item={machine} type="machine" viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 border-green-600/20 shadow-lg animate-fade-in">
            <CardContent>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">No machines found</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Try adjusting your search criteria or browse all equipment
                  </p>
                </div>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white text-sm"
                  onClick={() => {
                    setSearchQuery("")
                    setFilters({
                      listingType: "all",
                      condition: "all",
                      machineType: "all",
                      brand: "all",
                      priceRange: "all",
                      yearRange: "all",
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
