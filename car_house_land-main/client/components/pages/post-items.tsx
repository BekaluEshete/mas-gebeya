"use client"

import { useState, useEffect } from "react"
import { useApp } from "../../context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Upload, Car, Home, MapPin, Wrench, AlertCircle, X, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { authService } from "../../lib/auth"

export default function PostItems() {
  const { user, setIsAuthModalOpen } = useApp()
  const [isClient, setIsClient] = useState(false)
  
  // Form State
  const [selectedCategory, setSelectedCategory] = useState("cars")
  const [isPosting, setIsPosting] = useState(false)
  const [postStatus, setPostStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  
  // Item Data State - initialized with comprehensive fields to match Admin Dashboard
  const [itemData, setItemData] = useState<any>({
    // Common fields
    title: "",
    price: "",
    description: "",
    city: "Addis Ababa",
    region: "Addis Ababa",
    address: "",
    kebele: "",
    status: "available",
    
    // Listing specific
    listingType: "sale", // 'sale', 'rent', 'lease'
    condition: "used", // 'new', 'used', 'refurbished'
    
    // Car specific
    make: "",
    model: "",
    year: new Date().getFullYear(),
    mileage: "",
    fuelType: "gasoline",
    transmission: "manual",
    bodyType: "sedan",
    color: "",
    features: "", 
    
    // House specific (Property)
    propertyType: "apartment", 
    bedrooms: "",
    bathrooms: "",
    size: "", 
    floors: "",
    parkingSpaces: "",
    amenities: "",
    yearBuilt: new Date().getFullYear(),
    
    // Land specific
    sizeValue: "", 
    sizeUnit: "hectare", 
    zoning: "residential",
    landUse: "development",
    topography: "flat",
    soilType: "clay",
    waterAccess: "none",
    electricityAccess: false,
    roadAccess: false,
    
    // Machine specific
    category: "construction",
    brand: "",
    yearManufactured: new Date().getFullYear(),
    hoursUsed: "",
    machineType: "",
    specifications: "", 
  })

  // Strict enum values based on Server Models
  const machineCategories = [
    { value: "construction", label: "Construction" },
    { value: "agricultural", label: "Agricultural" },
    { value: "industrial", label: "Industrial" },
    { value: "automotive", label: "Automotive" },
    { value: "medical", label: "Medical" },
    { value: "electronics", label: "Electronics" },
    { value: "appliances", label: "Appliances" }
  ];

  const propertyTypes = [
     { value: "apartment", label: "Apartment" },
     { value: "house", label: "House" },
     { value: "villa", label: "Villa" },
     { value: "condo", label: "Condo" },
     { value: "commercial", label: "Commercial" },
     { value: "office", label: "Office" },
     { value: "warehouse", label: "Warehouse" }
  ];

  const validateForm = () => {
    const errors: string[] = []
    
    // Common validation
    if (!itemData.title || itemData.title.trim().length < 5) errors.push("Title must be at least 5 characters")
    if (!itemData.description || itemData.description.trim().length < 20) errors.push("Description must be at least 20 characters")
    if (!itemData.price || Number(itemData.price) <= 0) errors.push("Price must be a positive number")
    if (!itemData.city) errors.push("City is required")
    if (!itemData.region) errors.push("Region is required")
    if (!itemData.address) errors.push("Address is required")
    
    // Category specific
    if (selectedCategory === "cars") {
      if (!itemData.make) errors.push("Make is required")
      if (!itemData.model) errors.push("Model is required")
      if (!itemData.color) errors.push("Color is required")
    } else if (selectedCategory === "houses") {
      if (!itemData.propertyType) errors.push("Property type is required")
    } else if (selectedCategory === "lands") {
      if (!itemData.sizeValue || Number(itemData.sizeValue) <= 0) errors.push("Size value is required")
      if (!itemData.zoning) errors.push("Zoning is required")
    } else if (selectedCategory === "machines") {
       if (!itemData.category) errors.push("Category is required")
       if (!itemData.brand) errors.push("Brand is required")
    }
    
    return errors
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      if (files.length + uploadedImages.length > 5) {
        alert("You can upload a maximum of 5 images")
        return
      }
      setUploadedImages(prev => [...prev, ...files])
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handlePostItem = async () => {
    const token = authService.getStoredToken()
    if (!user && !token) {
      setIsAuthModalOpen(true)
      return
    }

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrorMessage(validationErrors.join(". "))
      setPostStatus("error")
      window.scrollTo(0, 0)
      return
    }

    setIsPosting(true)
    setPostStatus("idle")
    setErrorMessage("")

    try {
      const formData = new FormData()
      
      const finalTitle = itemData.title.trim().length >= 5 ? itemData.title.trim() : itemData.title.trim() + " Item"
      const finalDescription = itemData.description.trim().length >= 20 ? itemData.description.trim() : itemData.description.trim() + " - Detailed description provided upon request."
      
      if (selectedCategory === "cars") {
        formData.append("title", finalTitle)
        formData.append("description", finalDescription)
        formData.append("make", itemData.make?.trim() || "Unknown")
        formData.append("model", itemData.model?.trim() || "Unknown")
        formData.append("price", itemData.price.toString())
        formData.append("year", itemData.year?.toString() || new Date().getFullYear().toString())
        formData.append("mileage", itemData.mileage?.toString() || "0")
        formData.append("type", itemData.listingType || "sale")
        formData.append("condition", itemData.condition || "used")
        formData.append("fuelType", itemData.fuelType || "gasoline")
        formData.append("transmission", itemData.transmission || "manual")
        formData.append("color", itemData.color?.trim() || "Black")
        formData.append("bodyType", itemData.bodyType?.trim() || "sedan")
        formData.append("city", itemData.city.trim())
        formData.append("region", itemData.region.trim())
        formData.append("address", itemData.address.trim())
        if (itemData.kebele) formData.append("kebele", itemData.kebele.trim())
        formData.append("owner", user?._id || "")
        formData.append("status", "available")
        
        if (itemData.features) {
          // Convert comma separated string to JSON array
          const featuresArray = itemData.features.split(",").map((s: string) => s.trim()).filter((s: string) => s)
          formData.append("features", JSON.stringify(featuresArray))
        }

      } else if (selectedCategory === "houses") {
        formData.append("title", finalTitle)
        formData.append("description", finalDescription)
        formData.append("propertyType", itemData.propertyType || "apartment")
        formData.append("type", itemData.listingType || "sale")
        formData.append("price", itemData.price.toString())
        formData.append("bedrooms", itemData.bedrooms?.toString() || "1")
        formData.append("bathrooms", itemData.bathrooms?.toString() || "1")
        formData.append("size", itemData.size?.toString() || "0")
        formData.append("yearBuilt", itemData.yearBuilt?.toString() || new Date().getFullYear().toString())
        formData.append("floors", itemData.floors?.toString() || "1")
        formData.append("parkingSpaces", itemData.parkingSpaces?.toString() || "0")
        formData.append("condition", itemData.condition || "used")
        formData.append("city", itemData.city.trim())
        formData.append("region", itemData.region.trim())
        formData.append("address", itemData.address.trim())
        if (itemData.kebele) formData.append("kebele", itemData.kebele.trim())
        formData.append("owner", user?._id || "")
        formData.append("status", "available")
        
        if (itemData.amenities) {
           // Convert comma separated string to JSON array
           const amenitiesArray = itemData.amenities.split(",").map((s: string) => s.trim()).filter((s: string) => s)
           formData.append("amenities", JSON.stringify(amenitiesArray))
        }

      } else if (selectedCategory === "lands") {
        formData.append("title", finalTitle)
        formData.append("description", finalDescription)
        
        const sizeData = {
          value: itemData.sizeValue?.toString() || "0",
          unit: itemData.sizeUnit || "hectare"
        }
        formData.append("size", JSON.stringify(sizeData))
        
        formData.append("price", itemData.price.toString())
        formData.append("zoning", itemData.zoning || "residential")
        formData.append("landUse", itemData.landUse || "development")
        formData.append("topography", itemData.topography || "flat")
        formData.append("soilType", itemData.soilType || "clay")
        formData.append("waterAccess", itemData.waterAccess || "none")
        formData.append("electricityAccess", itemData.electricityAccess?.toString() || "false")
        formData.append("roadAccess", itemData.roadAccess?.toString() || "false")
        formData.append("type", itemData.listingType || "sale")
        formData.append("city", itemData.city.trim())
        formData.append("region", itemData.region.trim())
        formData.append("address", itemData.address.trim())
        if (itemData.kebele) formData.append("kebele", itemData.kebele.trim())
        formData.append("owner", user?._id || "")
        formData.append("status", "available")

      } else if (selectedCategory === "machines") {
        formData.append("title", finalTitle)
        formData.append("description", finalDescription)
        formData.append("category", itemData.category?.trim() || "construction")
        formData.append("brand", itemData.brand?.trim() || "Unknown")
        formData.append("model", itemData.model?.trim() || "Unknown")
        formData.append("price", itemData.price.toString())
        formData.append("year", itemData.yearManufactured?.toString() || new Date().getFullYear().toString())
        formData.append("hoursUsed", itemData.hoursUsed?.toString() || "0")
        formData.append("type", itemData.listingType || "sale")
        formData.append("condition", itemData.condition || "used")
        formData.append("city", itemData.city.trim())
        formData.append("region", itemData.region.trim())
        formData.append("address", itemData.address.trim())
        if (itemData.kebele) formData.append("kebele", itemData.kebele.trim())
        formData.append("owner", user?._id || "")
        formData.append("status", "available")
        
        if (itemData.machineType) {
           formData.append("machineType", itemData.machineType)
        }
        
        if (itemData.specifications) {
           // Convert comma separated string to JSON array
           const specsArray = itemData.specifications.split(",").map((s: string) => s.trim()).filter((s: string) => s)
           formData.append("specifications", JSON.stringify(specsArray))
        }
      }

      // Append images
      uploadedImages.forEach((file) => {
        formData.append("images", file)
      })

      // Determine endpoint
      const baseUrl = "https://car-house-land.onrender.com/api"
      let endpoint = ""
      switch(selectedCategory) {
        case "cars": endpoint = "/cars"; break;
        case "houses": endpoint = "/properties"; break; 
        case "lands": endpoint = "/lands"; break;
        case "machines": endpoint = "/machines"; break;
      }

      console.log(`Posting to ${baseUrl}${endpoint}`)

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || "Failed to post item")
      }

      const result = await response.json()
      console.log("Post success:", result)
      
      setPostStatus("success")
      setUploadedImages([])
      setItemData({ ...itemData, title: "", description: "", price: "" }) 
      window.scrollTo(0, 0)
      
    } catch (error: any) {
      console.error("Post error:", error)
      setErrorMessage(error.message || "An unexpected error occurred. Please try again.")
      setPostStatus("error")
      window.scrollTo(0, 0)
    } finally {
      setIsPosting(false)
    }
  }

  if (!isClient) return null

  const categories = [
    { id: "cars", label: "Car", icon: Car },
    { id: "houses", label: "House", icon: Home },
    { id: "lands", label: "Land", icon: MapPin },
    { id: "machines", label: "Machine", icon: Wrench },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
          Post New Item
        </h1>
        <p className="text-gray-600">
          Create a new listing. All listings require admin approval.
        </p>
      </div>

      {postStatus === "success" && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Your item has been posted successfully and is pending admin approval.
          </AlertDescription>
        </Alert>
      )}

      {postStatus === "error" && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Category Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
              selectedCategory === cat.id
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-transparent bg-white shadow-sm hover:bg-gray-50 text-gray-600"
            }`}
          >
            <cat.icon className={`w-6 h-6 mb-2 ${selectedCategory === cat.id ? "text-blue-600" : "text-gray-500"}`} />
            <span className="font-medium text-sm sm:text-base">{cat.label}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedCategory === "cars" && "Car Details"}
            {selectedCategory === "houses" && "Property Details"}
            {selectedCategory === "lands" && "Land Details"}
            {selectedCategory === "machines" && "Machine Details"}
          </CardTitle>
          <CardDescription>Fill in all required fields marked with *</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            
            {/* Common Fields Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Title * <span className="text-xs text-gray-400">(Min 5 chars)</span></Label>
                  <Input 
                    value={itemData.title}
                    onChange={(e) => setItemData({...itemData, title: e.target.value})}
                    placeholder="e.g., 2020 Toyota Corolla in Excellent Condition"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Price (ETB) *</Label>
                  <Input 
                    type="number"
                    value={itemData.price}
                    onChange={(e) => setItemData({...itemData, price: e.target.value})}
                    placeholder="0.00"
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Listing Type *</Label>
                  <Select 
                    value={itemData.listingType} 
                    onValueChange={(val) => setItemData({...itemData, listingType: val})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    value={itemData.condition} 
                    onValueChange={(val) => setItemData({...itemData, condition: val})}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="refurbished">Refurbished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Category Specific Fields */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {selectedCategory === "cars" ? "Vehicle Specs" : 
                 selectedCategory === "houses" ? "Property Specs" :
                 selectedCategory === "lands" ? "Land Specs" : "Machine Specs"}
              </h3>
              
              {/* CARS FORM */}
              {selectedCategory === "cars" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Make *</Label>
                    <Input 
                      value={itemData.make}
                      onChange={(e) => setItemData({...itemData, make: e.target.value})}
                      placeholder="e.g., Toyota"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Model *</Label>
                    <Input 
                      value={itemData.model}
                      onChange={(e) => setItemData({...itemData, model: e.target.value})}
                      placeholder="e.g., Corolla"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year (1990+)</Label>
                    <Input 
                      type="number"
                      value={itemData.year}
                      onChange={(e) => setItemData({...itemData, year: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mileage (km)</Label>
                    <Input 
                      type="number"
                      value={itemData.mileage}
                      onChange={(e) => setItemData({...itemData, mileage: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fuel Type</Label>
                    <Select 
                      value={itemData.fuelType} 
                      onValueChange={(val) => setItemData({...itemData, fuelType: val})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasoline">Gasoline</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Transmission</Label>
                    <Select 
                      value={itemData.transmission} 
                      onValueChange={(val) => setItemData({...itemData, transmission: val})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="automatic">Automatic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Body Type</Label>
                    <Select 
                      value={itemData.bodyType} 
                      onValueChange={(val) => setItemData({...itemData, bodyType: val})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Label>Color *</Label>
                    <Input 
                      value={itemData.color}
                      onChange={(e) => setItemData({...itemData, color: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <Label>Features (comma separated)</Label>
                     <Input 
                       value={itemData.features}
                       onChange={(e) => setItemData({...itemData, features: e.target.value})}
                       placeholder="e.g., Sunroof, Leather Seats, GPS"
                     />
                  </div>
                </div>
              )}

              {/* HOUSES FORM */}
              {selectedCategory === "houses" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Property Type *</Label>
                    <Select 
                      value={itemData.propertyType} 
                      onValueChange={(val) => setItemData({...itemData, propertyType: val})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Size (sqm)</Label>
                    <Input 
                      type="number"
                      value={itemData.size}
                      onChange={(e) => setItemData({...itemData, size: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <Input 
                      type="number"
                      value={itemData.bedrooms}
                      onChange={(e) => setItemData({...itemData, bedrooms: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <Input 
                      type="number"
                      value={itemData.bathrooms}
                      onChange={(e) => setItemData({...itemData, bathrooms: e.target.value})}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label>Floors</Label>
                    <Input 
                      type="number"
                      value={itemData.floors}
                      onChange={(e) => setItemData({...itemData, floors: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parking Spaces</Label>
                    <Input 
                      type="number"
                      value={itemData.parkingSpaces}
                      onChange={(e) => setItemData({...itemData, parkingSpaces: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                     <Label>Amenities (comma separated)</Label>
                     <Input 
                       value={itemData.amenities}
                       onChange={(e) => setItemData({...itemData, amenities: e.target.value})}
                       placeholder="e.g., Garden, Pool, Security"
                     />
                  </div>
                </div>
              )}

              {/* LANDS FORM */}
              {selectedCategory === "lands" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Size Value *</Label>
                    <Input 
                      type="number"
                      value={itemData.sizeValue}
                      onChange={(e) => setItemData({...itemData, sizeValue: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Size Unit</Label>
                    <Select 
                      value={itemData.sizeUnit} 
                      onValueChange={(val) => setItemData({...itemData, sizeUnit: val})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hectare">Hectare</SelectItem>
                        <SelectItem value="acre">Acre</SelectItem>
                        <SelectItem value="sqm">Square Meter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Zoning *</Label>
                    <Select 
                      value={itemData.zoning} 
                      onValueChange={(val) => setItemData({...itemData, zoning: val})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="agricultural">Agricultural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Land Use</Label>
                     <Select 
                      value={itemData.landUse} 
                      onValueChange={(val) => setItemData({...itemData, landUse: val})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="farming">Farming</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* MACHINES FORM */}
              {selectedCategory === "machines" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select 
                      value={itemData.category}
                      onValueChange={(val) => setItemData({...itemData, category: val})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {machineCategories.map((cat) => (
                           <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Brand *</Label>
                    <Input 
                      value={itemData.brand}
                      onChange={(e) => setItemData({...itemData, brand: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input 
                      value={itemData.model}
                      onChange={(e) => setItemData({...itemData, model: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year Manf. (1990+)</Label>
                     <Input 
                      type="number"
                      value={itemData.yearManufactured}
                      onChange={(e) => setItemData({...itemData, yearManufactured: e.target.value})}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label>Hours Used</Label>
                     <Input 
                      type="number"
                      value={itemData.hoursUsed}
                      onChange={(e) => setItemData({...itemData, hoursUsed: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <Label>Specifications (comma separated)</Label>
                     <Input 
                       value={itemData.specifications}
                       onChange={(e) => setItemData({...itemData, specifications: e.target.value})}
                     />
                  </div>
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input 
                    value={itemData.city}
                    onChange={(e) => setItemData({...itemData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Region *</Label>
                  <Input 
                    value={itemData.region}
                    onChange={(e) => setItemData({...itemData, region: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address *</Label>
                  <Input 
                    value={itemData.address}
                    onChange={(e) => setItemData({...itemData, address: e.target.value})}
                    placeholder="Specific location address"
                  />
                </div>
              </div>
            </div>

            {/* Description & Images */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Details</h3>
              <div className="space-y-2">
                <Label>Description * <span className="text-xs text-gray-400">(Min 20 chars)</span></Label>
                <Textarea 
                  value={itemData.description}
                  onChange={(e) => setItemData({...itemData, description: e.target.value})}
                  rows={4}
                  placeholder="Provide a detailed description of your item..."
                />
              </div>

              <div className="space-y-2">
                <Label>Images (Max 5)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload images</span>
                  </label>
                </div>
                
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-4">
                    {uploadedImages.map((file, idx) => (
                      <div key={idx} className="relative aspect-square">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="preview" 
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
              onClick={handlePostItem}
              disabled={isPosting}
            >
              {isPosting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Posting Item...
                </>
              ) : (
                "Submit Item for Approval"
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-500 mt-2">
              By posting, you agree to our terms and conditions.
            </p>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}
