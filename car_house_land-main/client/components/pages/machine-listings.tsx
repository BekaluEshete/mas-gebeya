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
import type { Machine } from "@/types"

export function MachineListings() {
  const { machines, machinesLoading, deals } = useApp() // Added machinesLoading and deals from context
  const [filteredMachines, setFilteredMachines] = React.useState<Machine[]>(machines)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [showMobileFilters, setShowMobileFilters] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [visibleItems, setVisibleItems] = React.useState(6)
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
    // Filter to show only approved items (or all if approved field doesn't exist)
    let filtered = machines.filter((machine) => machine.approved !== false) // Show if approved is true or undefined

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (machine) =>
          machine.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (machine.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
          (machine.specifications?.some((spec) => spec.toLowerCase().includes(searchQuery.toLowerCase())) || false),
      )
    }

    // Listing type filter
    if (filters.listingType !== "all") {
      filtered = filtered.filter((machine) => machine.listingType === filters.listingType)
    }

    // Condition filter
    if (filters.condition !== "all") {
      filtered = filtered.filter((machine) => machine.condition === filters.condition)
    }

    // Machine type filter
    if (filters.machineType !== "all") {
      filtered = filtered.filter((machine) => machine.machineType === filters.machineType)
    }

    // Brand filter
    if (filters.brand !== "all") {
      filtered = filtered.filter((machine) => machine.brand === filters.brand)
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      const allPrices = machines.map(m => m.price).sort((a, b) => a - b)
      const medianPrice = allPrices.length > 0 ? allPrices[Math.floor(allPrices.length / 2)] : 0
      if (filters.priceRange === "low") {
        filtered = filtered.filter((machine) => machine.price <= medianPrice)
      } else if (filters.priceRange === "high") {
        filtered = filtered.filter((machine) => machine.price > medianPrice)
      }
    }

    // Year range filter
    if (filters.yearRange !== "all") {
      if (filters.yearRange === "new") {
        filtered = filtered.filter((machine) => machine.year >= new Date().getFullYear() - 3)
      } else if (filters.yearRange === "old") {
        filtered = filtered.filter((machine) => machine.year < new Date().getFullYear() - 3)
      }
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

    setFilteredMachines(filtered)
  }, [searchQuery, filters, machines])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Get unique brands and machine types for filters
  const brands = Array.from(new Set(machines.map((m) => m.brand)))
  const machineTypes = Array.from(new Set(machines.map((m) => m.machineType)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <section className="bg-[#0046FF] text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">Heavy Equipment & Machinery</h1>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              Buy or rent industrial equipment and machinery for your business needs
            </p>

            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search machines by name, brand, or specifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg bg-white text-black"
                />
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Badge variant="secondary" className="bg-white/30 text-white px-3 py-1 text-sm">
                {machinesLoading ? "Loading..." : `${machines.length} Machines Available`}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white px-3 py-1 text-sm">
                Certified Equipment
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

            <Select value={filters.condition} onValueChange={(value) => handleFilterChange("condition", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Condition</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="refurbished">Refurbished</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.machineType} onValueChange={(value) => handleFilterChange("machineType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {machineTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.brand} onValueChange={(value) => handleFilterChange("brand", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
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

            <Select value={filters.yearRange} onValueChange={(value) => handleFilterChange("yearRange", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="new">Recent Models</SelectItem>
                <SelectItem value="old">Older Models</SelectItem>
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
            {machinesLoading ? "Loading..." : `Showing ${filteredMachines.length} of ${machines.length} machines`}{" "}
            {/* Added loading state */}
          </p>
        </div>

        {/* Machines Grid */}
        {machinesLoading ? ( // Added loading state display
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
        ) : filteredMachines.length > 0 ? (
          <>
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
              {filteredMachines.slice(0, visibleItems).map((machine) => (
                <ItemCard key={machine.id} item={machine} type="machine" />
              ))}
            </div>

            {/* Load More Button */}
            {visibleItems < filteredMachines.length && (
              <div className="mt-12 text-center animate-fade-in">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setVisibleItems((prev) => prev + 6)}
                  className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-300 group px-8"
                >
                  Show More Machines
                  <ChevronDown className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-y-1" />
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Showing {visibleItems} of {filteredMachines.length} machine listings
                </p>
              </div>
            )}
          </>
        ) : (
          <Card className="text-center py-12 border-blue-600/20 shadow-lg animate-fade-in">
            <CardContent>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-[#0046FF]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">No machines found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </div>
                <Button
                  className="bg-[#0046FF] hover:bg-[#0038CC] text-white text-sm"
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
