"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Settings, User, Loader2, Lock, Plus, Upload, X, Package } from "lucide-react"
import { useApp } from "@/context/app-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { authService } from "@/lib/auth"
import { createCar } from "@/lib/api/cars"
import { addHouse } from "@/lib/api/houses"

export function UserDashboard() {
  const { user, favorites, setIsAuthModalOpen, removeFromFavorites, addCar, addHouse, addLand, addMachine, refreshCars, refreshHouses, refreshLands, refreshMachines } = useApp()
  const [activeTab, setActiveTab] = useState("saved")
  const [editForm, setEditForm] = useState({ fullName: user?.fullName || "" })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  
  // Post Items state
  const [selectedCategory, setSelectedCategory] = useState("cars")
  const [postingItem, setPostingItem] = useState<any>({})
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isPosting, setIsPosting] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    console.log("[UserDashboard] User state:", user)
    if (user && user.role) {
      const targetPath = user.role === "admin" ? "/dashboard/admin" : "/dashboard/user"
      if (router.pathname !== targetPath) {
        console.log("[UserDashboard] Redirecting to:", targetPath)
        router.replace(targetPath)
      }
    }
  }, [user, router])

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = authService.getStoredToken()
      if (!token) throw new Error("No token available. Please log in again.")

      if (!user?._id) throw new Error("User ID is missing. Please refresh the page.")

      const response = await fetch(`https://car-house-land.onrender.com/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: editForm.fullName,
        }),
      })

      console.log("Response status:", response.status)
      const data = await response.json()

      if (response.ok) {
        const updatedUser = data
        console.log("Profile updated successfully:", updatedUser)
        alert("Profile updated successfully!")
        // Close the dialog on success
        setIsEditDialogOpen(false)
        // Optionally update the user state in context if supported by useApp
        // e.g., dispatch({ type: "UPDATE_USER", payload: updatedUser.data.user })
      } else {
        const errorMsg = data.message || "Unknown error"
        if (response.status === 403 && errorMsg.includes("Admin privileges required")) {
          throw new Error("You do not have permission to update your profile. An admin account is required.")
        }
        throw new Error(`Failed to update profile: ${response.status} - ${errorMsg}`)
      }
    } catch (error) {
      console.error("Fetch error:", error)
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        alert("Network error: Unable to connect to the server. Please check your internet connection or try again later.")
      } else {
        const errorMsg = error instanceof Error ? error.message : "Failed to update profile. Please try again."
        alert(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPasswordLoading(true)
    try {
      const token = authService.getStoredToken()
      if (!token) throw new Error("No token available. Please log in again.")

      const response = await fetch(`https://car-house-land.onrender.com/api/auth/change-password`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      console.log("Password change response status:", response.status)
      const data = await response.json()

      if (response.ok) {
        console.log("Password changed successfully:", data)
        alert("Password changed successfully! Please log in again.")
        // Close the dialog on success
        setIsPasswordDialogOpen(false)
        // Optionally log out the user and redirect to login
        await authService.logout() // Assuming logout clears tokens
        setIsAuthModalOpen(true) // Open login modal if supported
      } else {
        const errorMsg = data.message || "Unknown error"
        throw new Error(`Failed to change password: ${response.status} - ${errorMsg}`)
      }
    } catch (error) {
      console.error("Password change error:", error)
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        alert("Network error: Unable to connect to the server. Please check your internet connection or try again later.")
      } else {
        const errorMsg = error instanceof Error ? error.message : "Failed to change password. Please try again."
        alert(errorMsg)
      }
    } finally {
      setIsPasswordLoading(false)
    }
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

      alert("Item posted successfully!")
      setIsPostDialogOpen(false)
      setPostingItem({})
      setUploadedImages([])
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <User className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h1>
            <p className="text-gray-600 mb-6">
              Personalize your dashboard and manage your account.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user.fullName?.charAt(0)?.toUpperCase() || user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">
                  Welcome back, {user.fullName || user.name}!
                </h1>
                <p className="text-gray-600 mt-1">Manage your saved items and account settings</p>
                <Badge variant="outline" className="mt-2 capitalize border-blue-200 text-blue-700">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards (Only Saved Items) */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card className="bg-white border-red-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in-up">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{favorites?.length || 0}</div>
              <div className="text-gray-600 text-sm">Saved Items</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 animate-fade-in">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
            <TabsList className="grid w-full grid-cols-3 bg-blue-50 rounded-xl p-1">
              <TabsTrigger
                value="saved"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600"
              >
                Saved Items
              </TabsTrigger>
              <TabsTrigger
                value="post"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600"
              >
                Post Items
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="space-y-6 mt-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    <span>Saved Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {favorites && favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favorites.map((favorite) => {
                        // Get the correct URL based on item type
                        const getItemUrl = (type: string, itemId: string) => {
                          switch (type) {
                            case "car":
                              return `/cars/${itemId}`
                            case "house":
                              return `/houses/${itemId}`
                            case "land":
                              return `/lands/${itemId}`
                            case "machine":
                              return `/machines/${itemId}`
                            default:
                              return "#"
                          }
                        }
                        
                        const itemUrl = getItemUrl(favorite.type, favorite.item.id)
                        const itemImage = favorite.item.images?.[0] || favorite.item.image || "/placeholder.svg"
                        const itemTitle = favorite.item.title || favorite.item.name || "Untitled"
                        const itemPrice = favorite.item.price ? `${favorite.item.price.toLocaleString()} ብር` : "Price not available"
                        
                        return (
                          <div
                            key={favorite.id}
                            className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 hover:shadow-lg transition-all"
                          >
                            <Link href={itemUrl} className="block">
                              <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                                <img
                                  src={itemImage}
                                  alt={itemTitle}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg"
                                  }}
                                />
                              </div>
                              <div className="p-4">
                                <h3 className="font-semibold text-gray-900 capitalize mb-1">{favorite.type}</h3>
                                <p className="text-sm text-gray-900 font-medium mb-1 line-clamp-2">{itemTitle}</p>
                                <p className="text-sm text-blue-600 font-semibold mb-3">{itemPrice}</p>
                              </div>
                            </Link>
                            <div className="px-4 pb-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={(e) => {
                                  e.preventDefault()
                                  removeFromFavorites(favorite.id)
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No saved items yet</p>
                      <p className="text-sm text-gray-500">Items you save will sync from your backend favorites</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="post" className="space-y-6 mt-6">
              <Card className="border-gray-200">
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

                          {/* Category-specific fields */}
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
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span>Account Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.fullName || user.name}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.email}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Account Type</Label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <Badge variant="outline" className="capitalize border-blue-200 text-blue-700">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Member Since</Label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">December 2023</p>
                      </div>
                    </div>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-4">Edit Profile</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              value={editForm.fullName}
                              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={user.email}
                              disabled
                              className="bg-gray-100 cursor-not-allowed"
                            />
                          </div>
                          <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-4 flex items-center">
                          <Lock className="mr-2 h-4 w-4" /> Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              required
                            />
                          </div>
                          <Button type="submit" disabled={isPasswordLoading} className="w-full">
                            {isPasswordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Change Password"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}