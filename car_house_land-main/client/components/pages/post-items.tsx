"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Upload, X, Package } from "lucide-react"
import { useApp } from "@/context/app-context"
import { authService } from "@/lib/auth"

export function PostItems() {
  const { user, setIsAuthModalOpen, addCar, addHouse, addLand, addMachine, refreshCars, refreshHouses, refreshLands, refreshMachines } = useApp()
  const [selectedCategory, setSelectedCategory] = useState("cars")
  const [postingItem, setPostingItem] = useState<any>({})
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isPosting, setIsPosting] = useState(false)

  const router = useRouter()

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <Package className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Post Your Items</h1>
            <p className="text-gray-600 mb-6">
              You need to be logged in to post items.
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handlePostItem = async () => {
    if (!user?._id) {
      alert("You must be logged in to post items.")
      return
    }

    // Validate required fields
    const requiredFields = []
    if (!postingItem.title?.trim()) requiredFields.push("Title")
    if (!postingItem.price || postingItem.price <= 0) requiredFields.push("Price")
    if (!postingItem.city?.trim()) requiredFields.push("City")
    if (!postingItem.region?.trim()) requiredFields.push("Region")
    if (!postingItem.address?.trim()) requiredFields.push("Address")

    if (selectedCategory === "cars") {
      if (!postingItem.make?.trim()) requiredFields.push("Make")
      if (!postingItem.model?.trim()) requiredFields.push("Model")
    } else if (selectedCategory === "houses") {
      if (!postingItem.propertyType?.trim()) requiredFields.push("Property Type")
    } else if (selectedCategory === "lands") {
      if (!postingItem.sizeValue || postingItem.sizeValue <= 0) requiredFields.push("Size Value")
      if (!postingItem.zoning?.trim()) requiredFields.push("Zoning")
    }

    if (requiredFields.length > 0) {
      alert(`Please fill in the following required fields:\n• ${requiredFields.join("\n• ")}`)
      return
    }

    setIsPosting(true)
    try {
      const token = authService.getStoredToken()
      if (!token) throw new Error("No token available. Please log in again.")

      const formData = new FormData()
      const baseUrl = "https://car-house-land.onrender.com/api"
      let apiEndpoint = ""

      // Set owner to current user
      formData.append("owner", user._id)

      if (selectedCategory === "cars") {
        apiEndpoint = "cars"
        formData.append("title", postingItem.title.trim())
        formData.append("make", postingItem.make.trim())
        formData.append("model", postingItem.model.trim())
        formData.append("price", postingItem.price.toString())
        formData.append("year", postingItem.year?.toString() || new Date().getFullYear().toString())
        formData.append("mileage", postingItem.mileage?.toString() || "0")
        formData.append("type", postingItem.type || "sale")
        formData.append("condition", postingItem.condition || "used")
        formData.append("fuelType", postingItem.fuelType || "gasoline")
        formData.append("transmission", postingItem.transmission || "manual")
        formData.append("color", postingItem.color?.trim() || "Black")
        formData.append("bodyType", postingItem.bodyType?.trim() || "sedan")
        formData.append("description", postingItem.description?.trim() || "Quality vehicle available for sale or rent.")
        formData.append("city", postingItem.city.trim())
        formData.append("region", postingItem.region.trim())
        formData.append("address", postingItem.address.trim())
        formData.append("kebele", postingItem.kebele?.trim() || "")
        formData.append("status", "available")

        if (postingItem.features && Array.isArray(postingItem.features) && postingItem.features.length > 0) {
          formData.append("features", postingItem.features.join(","))
        }
      } else if (selectedCategory === "houses") {
        apiEndpoint = "properties"
        formData.append("title", postingItem.title.trim())
        formData.append("propertyType", postingItem.propertyType.trim())
        formData.append("price", postingItem.price.toString())
        formData.append("bedrooms", postingItem.bedrooms?.toString() || "1")
        formData.append("bathrooms", postingItem.bathrooms?.toString() || "1")
        formData.append("size", postingItem.size?.toString() || "0")
        formData.append("yearBuilt", postingItem.yearBuilt?.toString() || new Date().getFullYear().toString())
        formData.append("floors", postingItem.floors?.toString() || "1")
        formData.append("parkingSpaces", postingItem.parkingSpaces?.toString() || "0")
        formData.append("type", postingItem.type || "sale")
        formData.append("condition", postingItem.condition || "used")
        formData.append("description", postingItem.description?.trim() || "Quality property available for sale or rent.")
        formData.append("city", postingItem.city.trim())
        formData.append("region", postingItem.region.trim())
        formData.append("address", postingItem.address.trim())
        formData.append("kebele", postingItem.kebele?.trim() || "")
        formData.append("status", "available")

        if (postingItem.amenities && Array.isArray(postingItem.amenities) && postingItem.amenities.length > 0) {
          formData.append("amenities", postingItem.amenities.join(","))
        }
      } else if (selectedCategory === "lands") {
        apiEndpoint = "lands"
        formData.append("title", postingItem.title.trim())
        const sizeData = {
          value: postingItem.sizeValue.toString(),
          unit: postingItem.sizeUnit || "hectare",
        }
        formData.append("size", JSON.stringify(sizeData))
        formData.append("price", postingItem.price.toString())
        formData.append("zoning", postingItem.zoning.trim())
        formData.append("landUse", postingItem.landUse?.trim() || "development")
        formData.append("topography", postingItem.topography?.trim() || "flat")
        formData.append("waterAccess", postingItem.waterAccess?.trim() || "none")
        formData.append("roadAccess", postingItem.roadAccess?.trim() || "none")
        formData.append("type", postingItem.type || "sale")
        formData.append("description", postingItem.description?.trim() || "Quality land plot available for sale or rent.")
        formData.append("city", postingItem.city.trim())
        formData.append("region", postingItem.region.trim())
        formData.append("address", postingItem.address.trim())
        formData.append("kebele", postingItem.kebele?.trim() || "")
        formData.append("status", "available")
      } else if (selectedCategory === "machines") {
        apiEndpoint = "machines"
        formData.append("title", postingItem.title.trim())
        formData.append("category", postingItem.category?.trim() || "construction")
        formData.append("brand", postingItem.brand?.trim() || "Unknown")
        formData.append("model", postingItem.model?.trim() || "Unknown")
        formData.append("price", postingItem.price.toString())
        formData.append("yearManufactured", postingItem.yearManufactured?.toString() || new Date().getFullYear().toString())
        formData.append("type", postingItem.type || "sale")
        formData.append("condition", postingItem.condition || "used")
        formData.append("description", postingItem.description?.trim() || "Quality machine available for sale or rent.")
        formData.append("city", postingItem.city.trim())
        formData.append("region", postingItem.region.trim())
        formData.append("address", postingItem.address.trim())
        formData.append("kebele", postingItem.kebele?.trim() || "")
        formData.append("status", "available")

        if (postingItem.features && Array.isArray(postingItem.features) && postingItem.features.length > 0) {
          formData.append("features", postingItem.features.join(","))
        }
      }

      // Add uploaded images
      uploadedImages.forEach((file) => {
        formData.append("images", file)
      })

      const response = await fetch(`${baseUrl}/${apiEndpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to post item" }))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      const savedItem = result.data || result

      // Refresh the respective list
      if (selectedCategory === "cars") {
        await refreshCars()
        if (savedItem) addCar(savedItem)
      } else if (selectedCategory === "houses") {
        await refreshHouses()
        if (savedItem) addHouse(savedItem)
      } else if (selectedCategory === "lands") {
        await refreshLands()
        if (savedItem) addLand(savedItem)
      } else if (selectedCategory === "machines") {
        await refreshMachines()
        if (savedItem) addMachine(savedItem)
      }

      alert("Item posted successfully! It will appear after admin approval.")
      setIsPostDialogOpen(false)
      setPostingItem({})
      setUploadedImages([])
      // Optionally redirect to dashboard to see posted items
      router.push("/dashboard/user")
    } catch (error) {
      console.error("Error posting item:", error)
      const errorMsg = error instanceof Error ? error.message : "Failed to post item. Please try again."
      alert(errorMsg)
    } finally {
      setIsPosting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5) // Limit to 5 images
      setUploadedImages(files)
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">
                  Post Your Items
                </h1>
                <p className="text-gray-600 mt-1">List your vehicles, houses, lands, or machines for sale or rent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Post Items Form */}
        <Card className="border-gray-200 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span>Post New Item</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cars">Cars</SelectItem>
                    <SelectItem value="houses">Houses</SelectItem>
                    <SelectItem value="lands">Lands</SelectItem>
                    <SelectItem value="machines">Machines</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isPostDialogOpen} onOpenChange={(open) => {
                setIsPostDialogOpen(open)
                if (!open) {
                  setPostingItem({})
                  setUploadedImages([])
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Post New {selectedCategory === "cars" ? "Car" : selectedCategory === "houses" ? "House" : selectedCategory === "lands" ? "Land" : "Machine"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Post New {selectedCategory === "cars" ? "Car" : selectedCategory === "houses" ? "House" : selectedCategory === "lands" ? "Land" : "Machine"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Common Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          value={postingItem.title || ""}
                          onChange={(e) => setPostingItem({ ...postingItem, title: e.target.value })}
                          placeholder="Enter title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price (ETB) *</Label>
                        <Input
                          type="number"
                          value={postingItem.price || ""}
                          onChange={(e) => setPostingItem({ ...postingItem, price: Number(e.target.value) })}
                          placeholder="Enter price"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Listing Type *</Label>
                        <Select
                          value={postingItem.type || "sale"}
                          onValueChange={(value) => setPostingItem({ ...postingItem, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sale">For Sale</SelectItem>
                            <SelectItem value="rent">For Rent</SelectItem>
                            {(selectedCategory === "lands" || selectedCategory === "machines") && (
                              <SelectItem value="lease">For Lease</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Condition</Label>
                        <Select
                          value={postingItem.condition || "used"}
                          onValueChange={(value) => setPostingItem({ ...postingItem, condition: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="used">Used</SelectItem>
                            <SelectItem value="refurbished">Refurbished</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Location Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City *</Label>
                        <Input
                          value={postingItem.city || ""}
                          onChange={(e) => setPostingItem({ ...postingItem, city: e.target.value })}
                          placeholder="Addis Ababa"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Region *</Label>
                        <Input
                          value={postingItem.region || ""}
                          onChange={(e) => setPostingItem({ ...postingItem, region: e.target.value })}
                          placeholder="Addis Ababa"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Address *</Label>
                      <Input
                        value={postingItem.address || ""}
                        onChange={(e) => setPostingItem({ ...postingItem, address: e.target.value })}
                        placeholder="Bole, Megenagna"
                      />
                    </div>

                    {/* Category-specific fields - Same as in dashboard */}
                    {selectedCategory === "cars" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Make *</Label>
                            <Input
                              value={postingItem.make || ""}
                              onChange={(e) => setPostingItem({ ...postingItem, make: e.target.value })}
                              placeholder="Toyota, BMW"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Model *</Label>
                            <Input
                              value={postingItem.model || ""}
                              onChange={(e) => setPostingItem({ ...postingItem, model: e.target.value })}
                              placeholder="Camry, X5"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Year</Label>
                            <Input
                              type="number"
                              value={postingItem.year || ""}
                              onChange={(e) => setPostingItem({ ...postingItem, year: Number(e.target.value) })}
                              placeholder="2020"
                              min="1900"
                              max={new Date().getFullYear() + 1}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Mileage</Label>
                            <Input
                              type="number"
                              value={postingItem.mileage || ""}
                              onChange={(e) => setPostingItem({ ...postingItem, mileage: Number(e.target.value) })}
                              placeholder="50000"
                              min="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Color *</Label>
                            <Input
                              value={postingItem.color || ""}
                              onChange={(e) => setPostingItem({ ...postingItem, color: e.target.value })}
                              placeholder="Red, Blue, Black"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Fuel Type *</Label>
                            <Select
                              value={postingItem.fuelType || "gasoline"}
                              onValueChange={(value) => setPostingItem({ ...postingItem, fuelType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gasoline">Gasoline</SelectItem>
                                <SelectItem value="diesel">Diesel</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                <SelectItem value="electric">Electric</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Transmission *</Label>
                            <Select
                              value={postingItem.transmission || "manual"}
                              onValueChange={(value) => setPostingItem({ ...postingItem, transmission: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manual">Manual</SelectItem>
                                <SelectItem value="automatic">Automatic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Body Type *</Label>
                          <Select
                            value={postingItem.bodyType || "sedan"}
                            onValueChange={(value) => setPostingItem({ ...postingItem, bodyType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sedan">Sedan</SelectItem>
                              <SelectItem value="suv">SUV</SelectItem>
                              <SelectItem value="hatchback">Hatchback</SelectItem>
                              <SelectItem value="coupe">Coupe</SelectItem>
                              <SelectItem value="pickup">Pickup</SelectItem>
                              <SelectItem value="van">Van</SelectItem>
                              <SelectItem value="convertible">Convertible</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Features (comma separated)</Label>
                          <Input
                            value={Array.isArray(postingItem.features) ? postingItem.features.join(", ") : postingItem.features || ""}
                            onChange={(e) => setPostingItem({
                              ...postingItem,
                              features: e.target.value.split(",").map(f => f.trim()).filter(f => f)
                            })}
                            placeholder="Air Conditioning, GPS, Leather Seats"
                          />
                        </div>
                      </>
                    )}

                    {selectedCategory === "houses" && (
                      <>
                        <div className="space-y-2">
                          <Label>Property Type *</Label>
                          <Select
                            value={postingItem.propertyType || ""}
                            onValueChange={(value) => setPostingItem({ ...postingItem, propertyType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="villa">Villa</SelectItem>
                              <SelectItem value="condo">Condo</SelectItem>
                              <SelectItem value="townhouse">Townhouse</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Bedrooms</Label>
                            <Input
                              type="number"
                              value={postingItem.bedrooms || ""}
                              onChange={(e) => setPostingItem({ ...postingItem, bedrooms: Number(e.target.value) })}
                              placeholder="3"
                              min="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Bathrooms</Label>
                            <Input
                              type="number"
                              value={postingItem.bathrooms || ""}
                              onChange={(e) => setPostingItem({ ...postingItem, bathrooms: Number(e.target.value) })}
                              placeholder="2"
                              min="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Size (sqm)</Label>
                            <Input
                              type="number"
                              value={postingItem.size || ""}
                              onChange={(e) => setPostingItem({ ...postingItem, size: Number(e.target.value) })}
                              placeholder="150"
                              min="0"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {selectedCategory === "lands" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Size Value *</Label>
                            <Input
                              type="number"
                              value={postingItem.sizeValue || ""}
                              onChange={(e) => setPostingItem({ ...postingItem, sizeValue: Number(e.target.value) })}
                              placeholder="1.5"
                              min="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Size Unit</Label>
                            <Select
                              value={postingItem.sizeUnit || "hectare"}
                              onValueChange={(value) => setPostingItem({ ...postingItem, sizeUnit: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hectare">Hectare</SelectItem>
                                <SelectItem value="acre">Acre</SelectItem>
                                <SelectItem value="sqm">Square Meter</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Zoning *</Label>
                            <Select
                              value={postingItem.zoning || ""}
                              onValueChange={(value) => setPostingItem({ ...postingItem, zoning: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="residential">Residential</SelectItem>
                                <SelectItem value="commercial">Commercial</SelectItem>
                                <SelectItem value="industrial">Industrial</SelectItem>
                                <SelectItem value="agricultural">Agricultural</SelectItem>
                                <SelectItem value="recreational">Recreational</SelectItem>
                                <SelectItem value="mixed">Mixed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Land Use</Label>
                            <Select
                              value={postingItem.landUse || "development"}
                              onValueChange={(value) => setPostingItem({ ...postingItem, landUse: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="development">Development</SelectItem>
                                <SelectItem value="farming">Farming</SelectItem>
                                <SelectItem value="commercial">Commercial</SelectItem>
                                <SelectItem value="recreation">Recreation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedCategory === "machines" && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Input
                              value={postingItem.category || ""}
                              onChange={(e) => setPostingItem({ ...postingItem, category: e.target.value })}
                              placeholder="Construction, Agriculture"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Brand</Label>
                            <Input
                              value={postingItem.brand || ""}
                              onChange={(e) => setPostingItem({ ...postingItem, brand: e.target.value })}
                              placeholder="Caterpillar, John Deere"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Model</Label>
                            <Input
                              value={postingItem.model || ""}
                              onChange={(e) => setPostingItem({ ...postingItem, model: e.target.value })}
                              placeholder="Model name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Year Manufactured</Label>
                            <Input
                              type="number"
                              value={postingItem.yearManufactured || ""}
                              onChange={(e) => setPostingItem({ ...postingItem, yearManufactured: Number(e.target.value) })}
                              placeholder="2020"
                              min="1900"
                              max={new Date().getFullYear() + 1}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={postingItem.description || ""}
                        onChange={(e) => setPostingItem({ ...postingItem, description: e.target.value })}
                        placeholder="Describe your item..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Images (up to 5)</Label>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                        />
                        {uploadedImages.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {uploadedImages.map((file, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-20 object-cover rounded"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-0 right-0 h-6 w-6 p-0"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handlePostItem}
                      disabled={isPosting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isPosting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Post Item
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

