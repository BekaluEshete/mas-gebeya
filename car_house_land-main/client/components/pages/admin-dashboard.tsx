"use client"

import React from "react"

import { useState } from "react"
import { useApp } from "@/context/app-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts"
import {
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Bell,
  PieChart,
  Activity,
  Plus,
  Eye,
  Edit,
  Trash2,
  Upload,
  X,
  ImageIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  Home,
  MapPin,
  Wrench,
  BarChart3,
  Target,
  Globe,
  ShoppingCart,
  Star,
  ArrowUpRight,
  Download,
  RefreshCw,
} from "lucide-react"
import type { Deal } from "@/types"
import { Label } from "@/components/ui/label"
import { createCar } from "@/lib/api/cars"
import { authService } from "@/lib/auth"

export function AdminDashboard() {
  const {
    user,
    deals,
    updateDealStatus,
    getPendingDealsCount,
    cars,
    houses,
    machines,
    lands,
    addCar,
    updateCar,
    deleteCar,
    addHouse,
    updateHouse,
    deleteHouse,
    addMachine,
    updateMachine,
    deleteMachine,
    addLand,
    updateLand,
    deleteLand,
    refreshDeals,
  } = useApp()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedCategory, setSelectedCategory] = useState("cars")
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isDealDetailOpen, setIsDealDetailOpen] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)
  const [viewingItem, setViewingItem] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [deletingItem, setDeletingItem] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  // const [carsData, setCarsData] = React.useState(CARS_DATA)
  // const [housesData, setHousesData] = React.useState(HOUSES_DATA)
  // const [landsData, setHousesData] = React.useState(LANDS_DATA)
  // const [machinesData, setMachinesData] = React.useState(MACHINES_DATA)

  const [users, setUsers] = React.useState([])
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(true)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [deletingUser, setDeletingUser] = useState<any>(null)
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false)

  const [owners, setOwners] = useState([])
  const [isLoadingOwners, setIsLoadingOwners] = useState(false)

  const fetchOwners = async () => {
    setIsLoadingOwners(true)
    try {
      const token = authService.getStoredToken()
      if (!token) {
        console.error("[v0] No authentication token found")
        return
      }

      console.log("[v0] Fetching owners from API...")
      const response = await fetch("https://car-house-land.onrender.com/api/users/owner/list", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Owners API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Owners API response:", data)

        if (data.success && data.data) {
          setOwners(data.data)
          console.log("[v0] Successfully loaded owners:", data.data.length)
        } else {
          console.error("[v0] Invalid owners response format:", data)
        }
      } else {
        const errorText = await response.text()
        console.error("[v0] Failed to fetch owners:", response.status, errorText)
      }
    } catch (error) {
      console.error("[v0] Error fetching owners:", error)
    } finally {
      setIsLoadingOwners(false)
    }
  }

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true)

        const token = authService.getStoredToken()
        if (!token) {
          console.error("No authentication token found")
          return
        }

        const response = await fetch("https://car-house-land.onrender.com/api/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.status === 401) {
          console.error("Authentication failed - token may be expired")
          return
        }

        const data = await response.json()

        if (data.status === "success" && data.data?.users) {
          // Transform API data to match component structure
          const transformedUsers = data.data.users.map((user: any) => ({
            id: user._id,
            name: user.fullName,
            email: user.email,
            role: user.role,
            status: user.isActive ? "active" : "inactive",
            joinedDate: user.createdAt,
            lastActive: user.lastLogin || user.updatedAt,
            totalDeals: 0, // This would need to come from a separate API call
            avatar: user.avatar || "/placeholder.svg?height=40&width=40",
            phone: user.phone,
            isVerified: user.isVerified,
          }))
          setUsers(transformedUsers)
        } else {
          console.error("Failed to fetch users:", data)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  React.useEffect(() => {
    if (activeTab === "listings") {
      fetchOwners()
    }
  }, [activeTab])

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-responsive-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-responsive-base text-gray-600 mt-2">You need admin privileges to access this page</p>
        </div>
      </div>
    )
  }

  const totalListings = cars.length + houses.length + lands.length + machines.length
  const totalRevenue = 2450000
  const activeUsers = 1250
  const pendingDeals = getPendingDealsCount()

  const categoryData = [
    {
      name: "Cars",
      value: cars.length,
      color: "var(--color-cars-primary)",
      percentage: Math.round((cars.length / totalListings) * 100),
    },
    {
      name: "Houses",
      value: houses.length,
      color: "var(--color-houses-primary)",
      percentage: Math.round((houses.length / totalListings) * 100),
    },
    {
      name: "Lands",
      value: lands.length,
      color: "var(--color-lands-primary)",
      percentage: Math.round((lands.length / totalListings) * 100),
    },
    {
      name: "Machines",
      value: machines.length,
      color: "var(--color-machines-primary)",
      percentage: Math.round((machines.length / totalListings) * 100),
    },
  ]

  const revenueData = [
    { month: "Jan", revenue: 180000, listings: 45, users: 120, deals: 8 },
    { month: "Feb", revenue: 220000, listings: 52, users: 145, deals: 12 },
    { month: "Mar", revenue: 280000, listings: 68, users: 180, deals: 15 },
    { month: "Apr", revenue: 320000, listings: 75, users: 210, deals: 18 },
    { month: "May", revenue: 380000, listings: 89, users: 250, deals: 22 },
    { month: "Jun", revenue: 420000, listings: 95, users: 280, deals: 25 },
  ]

  const performanceData = [
    { name: "Conversion Rate", value: 68, color: "#10b981" },
    { name: "User Satisfaction", value: 85, color: "#3b82f6" },
    { name: "Platform Uptime", value: 99.8, color: "#8b5cf6" },
    { name: "Response Time", value: 92, color: "#f97316" },
  ]

  const trafficData = [
    { time: "00:00", visitors: 120, pageViews: 340 },
    { time: "04:00", visitors: 80, pageViews: 220 },
    { time: "08:00", visitors: 280, pageViews: 680 },
    { time: "12:00", visitors: 450, pageViews: 1200 },
    { time: "16:00", visitors: 380, pageViews: 950 },
    { time: "20:00", visitors: 320, pageViews: 780 },
  ]

  const topPerformingItems = [
    { name: "Luxury Sedan", category: "Cars", views: 1250, inquiries: 45, revenue: 85000 },
    { name: "Modern Villa", category: "Houses", views: 980, inquiries: 32, revenue: 120000 },
    { name: "Industrial Plot", category: "Lands", views: 750, inquiries: 28, revenue: 65000 },
    { name: "Excavator Pro", category: "Machines", views: 650, inquiries: 22, revenue: 45000 },
  ]

  const getCurrentData = () => {
    let data = []
    switch (selectedCategory) {
      case "cars":
        data = cars
        break
      case "houses":
        data = houses
        break
      case "lands":
        data = lands
        break
      case "machines":
        data = machines
        break
      default:
        data = []
    }

    return data.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })
  }

  const handleDeleteItem = (item: any) => {
    switch (selectedCategory) {
      case "cars":
        deleteCar(item.id)
        break
      case "houses":
        deleteHouse(item.id)
        break
      case "lands":
        deleteLand(item.id)
        break
      case "machines":
        deleteMachine(item.id)
        break
    }
  }

  const handleSaveItem = async (itemData: any) => {
    const itemWithDefaults = {
      ...itemData,
      images: uploadedImages,
      id: itemData.id || `${selectedCategory.slice(0, -1)}-${Date.now()}`,
      createdAt: itemData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rating: itemData.rating || 4.5,
      reviews: itemData.reviews || 0,
      status: itemData.status || "available",
      sellerName: itemData.sellerName || "Admin Added",
      sellerPhone: itemData.sellerPhone || "+251 911 000 000",
      sellerEmail: itemData.sellerEmail || "admin@example.com",
      sellerId: itemData.sellerId || "admin-1",
      listingType: itemData.listingType || "sale",
    }

    if (selectedCategory === "cars") {
      try {
        if (itemData.id && getCurrentData().find((item: any) => item.id === itemData.id)) {
          // Update existing car via API
          const formData = new FormData()

          // Add all car fields to FormData
          Object.entries(itemWithDefaults).forEach(([key, value]) => {
            if (key === "images" && Array.isArray(value)) {
              // Handle images separately if needed
              value.forEach((image, index) => {
                if (image instanceof File) {
                  formData.append("images", image)
                }
              })
            } else if (value !== null && value !== undefined) {
              formData.append(key, String(value))
            }
          })

          const token = localStorage.getItem("accessToken")
          if (token) {
            const updatedCar = await updateCar(itemData.id, formData, token)
            if (updatedCar) {
              updateCar(itemData.id, updatedCar)
              console.log("[v0] Car updated successfully via API")
            } else {
              console.error("[v0] Failed to update car via API")
              // Fallback to local state update
              updateCar(itemData.id, itemWithDefaults)
            }
          } else {
            console.error("[v0] No auth token found")
            updateCar(itemData.id, itemWithDefaults)
          }
        } else {
          // Create new car via API
          const formData = new FormData()

          // Add all car fields to FormData
          Object.entries(itemWithDefaults).forEach(([key, value]) => {
            if (key === "images" && Array.isArray(value)) {
              // Handle images separately if needed
              value.forEach((image, index) => {
                if (image instanceof File) {
                  formData.append("images", image)
                }
              })
            } else if (value !== null && value !== undefined) {
              formData.append(key, String(value))
            }
          })

          const token = localStorage.getItem("accessToken")
          if (token) {
            const newCar = await createCar(formData, token)
            if (newCar) {
              addCar(newCar)
              console.log("[v0] Car created successfully via API")
            } else {
              console.error("[v0] Failed to create car via API")
              // Fallback to local state addition
              addCar(itemWithDefaults)
            }
          } else {
            console.error("[v0] No auth token found")
            addCar(itemWithDefaults)
          }
        }
      } catch (error) {
        console.error("[v0] Error with car API operation:", error)
        // Fallback to local state operations
        if (itemData.id && getCurrentData().find((item: any) => item.id === itemData.id)) {
          updateCar(itemData.id, itemWithDefaults)
        } else {
          addCar(itemWithDefaults)
        }
      }
    } else {
      // Keep existing logic for other categories (houses, lands, machines)
      if (itemData.id && getCurrentData().find((item: any) => item.id === itemData.id)) {
        // Update existing item
        switch (selectedCategory) {
          case "houses":
            updateHouse(itemData.id, itemWithDefaults)
            break
          case "lands":
            updateLand(itemData.id, itemWithDefaults)
            break
          case "machines":
            updateMachine(itemData.id, itemWithDefaults)
            break
        }
      } else {
        // Add new item
        switch (selectedCategory) {
          case "houses":
            addHouse(itemWithDefaults)
            break
          case "lands":
            addLand(itemWithDefaults)
            break
          case "machines":
            addMachine(itemWithDefaults)
            break
        }
      }
    }
  }

  const getCurrentDataSetter = () => {
    return () => {}
  }

  const handleEditUser = (user: any) => {
    setEditingUser({
      ...user,
      fullName: user.fullName,
      street: user.address?.street || "",
      city: user.address?.city || "",
      region: user.address?.region || "",
      country: user.address?.country || "ETHIOPIA",
      isActive: user.isActive,
      isVerified: user.isVerified,
    })
    setIsUserDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    try {
      const token = authService.getStoredToken()
      if (!token) {
        console.error("[v0] No authentication token found")
        return
      }

      const userData = {
        fullName: editingUser.fullName,
        email: editingUser.email,
        password: editingUser.password,
        phone: editingUser.phone,
        role: editingUser.role || "user",
        avatar: editingUser.avatar || null,
        address: {
          street: editingUser.street || "",
          city: editingUser.city || "",
          region: editingUser.region || "",
          country: editingUser.country || "ETHIOPIA",
        },
        isActive: editingUser.isActive !== undefined ? editingUser.isActive : true,
        isVerified: editingUser.isVerified !== undefined ? editingUser.isVerified : false,
      }

      console.log("[v0] Saving user with data:", userData)
      console.log("[v0] Is editing existing user:", !!editingUser._id)

      const url = editingUser._id
        ? `https://car-house-land.onrender.com/api/users/${editingUser._id}`
        : "https://car-house-land.onrender.com/api/users"

      const method = editingUser._id ? "PUT" : "POST"

      console.log("[v0] Making request to:", url, "with method:", method)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log("[v0] User saved successfully:", responseData)

        // Refresh the users list
        const fetchUsers = async () => {
          try {
            setIsLoadingUsers(true)

            const token = authService.getStoredToken()
            if (!token) {
              console.error("No authentication token found")
              return
            }

            const response = await fetch("https://car-house-land.onrender.com/api/users", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })

            if (response.status === 401) {
              console.error("Authentication failed - token may be expired")
              return
            }

            const data = await response.json()

            if (data.status === "success" && data.data?.users) {
              // Transform API data to match component structure
              const transformedUsers = data.data.users.map((user: any) => ({
                id: user._id,
                name: user.fullName,
                email: user.email,
                role: user.role,
                status: user.isActive ? "active" : "inactive",
                joinedDate: user.createdAt,
                lastActive: user.lastLogin || user.updatedAt,
                totalDeals: 0, // This would need to come from a separate API call
                avatar: user.avatar || "/placeholder.svg?height=40&width=40",
                phone: user.phone,
                isVerified: user.isVerified,
              }))
              setUsers(transformedUsers)
            } else {
              console.error("Failed to fetch users:", data)
            }
          } catch (error) {
            console.error("Error fetching users:", error)
          } finally {
            setIsLoadingUsers(false)
          }
        }
        fetchUsers()
        setIsUserDialogOpen(false)
        setEditingUser(null)
      } else {
        const errorData = await response.json().catch(() => null)
        console.error("[v0] Failed to save user. Status:", response.status)
        console.error("[v0] Error response:", errorData)
        console.error("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

        if (errorData?.message) {
          console.error("[v0] Server error message:", errorData.message)
        }
        if (errorData?.errors) {
          console.error("[v0] Validation errors:", errorData.errors)
        }
      }
    } catch (error) {
      console.error("[v0] Network or other error saving user:", error)
      if (error instanceof Error) {
        console.error("[v0] Error message:", error.message)
        console.error("[v0] Error stack:", error.stack)
      }
    }
  }

  const toggleUserStatus = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === userId ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u)),
    )
  }

  const handleView = (item: any) => {
    setViewingItem(item)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setUploadedImages(item.images || [])
    setIsDialogOpen(true)
  }

  const handleDelete = (item: any) => {
    setDeletingItem(item)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!deletingItem) return

    handleDeleteItem(deletingItem)

    setIsDeleteDialogOpen(false)
    setDeletingItem(null)
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    console.log(
      "[v0] Selected files:",
      files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    )

    if (files.length > 0) {
      // Store the actual File objects for FormData
      setUploadedImages((prev) => [...prev, ...files])
    }
  }

  const removeImage = (index: number) => {
    const imageToRemove = uploadedImages[index]
    if (imageToRemove instanceof File) {
      const objectUrl = URL.createObjectURL(imageToRemove)
      URL.revokeObjectURL(objectUrl)
    }
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!editingItem) return

    const requiredFields = []

    if (selectedCategory === "houses") {
      if (!editingItem.title?.trim()) requiredFields.push("Title")
      if (!editingItem.propertyType?.trim()) requiredFields.push("Property Type")
      if (!editingItem.price || editingItem.price <= 0) requiredFields.push("Price")
      if (!editingItem.city?.trim()) requiredFields.push("City")
      if (!editingItem.region?.trim()) requiredFields.push("Region")
      if (!editingItem.address?.trim()) requiredFields.push("Address")
      if (!editingItem.owner?.trim()) requiredFields.push("Owner")
      if (!editingItem.description?.trim() || editingItem.description.length < 20) {
        requiredFields.push("Description (minimum 20 characters)")
      }
    }

    if (selectedCategory === "lands") {
      if (!editingItem.title?.trim()) requiredFields.push("Title")
      if (!editingItem.sizeValue || editingItem.sizeValue <= 0) requiredFields.push("Size Value")
      if (!editingItem.price || editingItem.price <= 0) requiredFields.push("Price")
      if (!editingItem.zoning?.trim()) requiredFields.push("Zoning")
      if (!editingItem.landUse?.trim()) requiredFields.push("Land Use")
      if (!editingItem.topography?.trim()) requiredFields.push("Topography")
      if (!editingItem.city?.trim()) requiredFields.push("City")
      if (!editingItem.region?.trim()) requiredFields.push("Region")
      if (!editingItem.address?.trim()) requiredFields.push("Address")
      if (!editingItem.owner?.trim()) requiredFields.push("Owner")
      if (!editingItem.description?.trim() || editingItem.description.length < 20) {
        requiredFields.push("Description (minimum 20 characters)")
      }
    }

    if (requiredFields.length > 0) {
      console.error("[v0] Missing required fields:", requiredFields)
      alert(`Please fill in the following required fields:\n• ${requiredFields.join("\n• ")}`)
      return
    }

    console.log(`[v0] Saving ${selectedCategory} with data:`, editingItem)
    console.log(
      "[v0] Uploaded images:",
      uploadedImages.map((img) => (img instanceof File ? { name: img.name, size: img.size } : img)),
    )

    try {
      const token = authService.getStoredToken()
      if (!token) {
        console.error("[v0] No authentication token found")
        return
      }

      const formData = new FormData()

      if (selectedCategory === "cars") {
        // Car-specific fields
        formData.append("title", editingItem.title || "")
        formData.append("make", editingItem.make || "")
        formData.append("model", editingItem.model || "")
        formData.append("price", editingItem.price?.toString() || "0")
        formData.append("year", editingItem.year?.toString() || "")
        formData.append("mileage", editingItem.mileage?.toString() || "0")
        formData.append("type", editingItem.type || "sale")
        formData.append("condition", editingItem.condition || "used")
        formData.append("fuelType", editingItem.fuelType || "gasoline")
        formData.append("transmission", editingItem.transmission || "manual")
        formData.append("color", editingItem.color || "")
        formData.append("bodyType", editingItem.bodyType || "sedan")
        formData.append("description", editingItem.description || "")
        formData.append("city", editingItem.city || "")
        formData.append("region", editingItem.region || "")
        formData.append("address", editingItem.address || "")
        formData.append("kebele", editingItem.kebele || "")
        formData.append("owner", editingItem.owner || "")
        formData.append("status", editingItem.status || "available")

        // Add features as JSON string
        if (editingItem.features && editingItem.features.length > 0) {
          formData.append("features", JSON.stringify(editingItem.features))
        }
      } else if (selectedCategory === "houses") {
        // House-specific fields
        formData.append("title", editingItem.title || "")
        formData.append("propertyType", editingItem.propertyType || "")
        formData.append("price", editingItem.price?.toString() || "0")
        formData.append("bedrooms", editingItem.bedrooms?.toString() || "0")
        formData.append("bathrooms", editingItem.bathrooms?.toString() || "0")
        formData.append("size", editingItem.size?.toString() || "0")
        formData.append("yearBuilt", editingItem.yearBuilt?.toString() || "")
        formData.append("floors", editingItem.floors?.toString() || "1")
        formData.append("parkingSpaces", editingItem.parkingSpaces?.toString() || "0")
        formData.append("type", editingItem.type || "sale")
        formData.append("condition", editingItem.condition || "used")
        formData.append("description", editingItem.description || "")
        formData.append("city", editingItem.city || "")
        formData.append("region", editingItem.region || "")
        formData.append("address", editingItem.address || "")
        formData.append("kebele", editingItem.kebele || "")
        formData.append("owner", editingItem.owner || "")
        formData.append("status", editingItem.status || "available")

        // Add amenities as JSON string
        if (editingItem.amenities && editingItem.amenities.length > 0) {
          formData.append("amenities", JSON.stringify(editingItem.amenities))
        }
      } else if (selectedCategory === "lands") {
        // Land-specific fields
        formData.append("title", editingItem.title || "")
        const sizeData = {
          value: editingItem.sizeValue?.toString() || "0",
          unit: editingItem.sizeUnit || "hectare",
        }
        formData.append("size", JSON.stringify(sizeData))
        formData.append("price", editingItem.price?.toString() || "0")
        formData.append("pricePerSqm", editingItem.pricePerSqm?.toString() || "0")
        formData.append("zoning", editingItem.zoning || "")
        formData.append("landUse", editingItem.landUse || "")
        formData.append("topography", editingItem.topography || "")
        formData.append("soilType", editingItem.soilType || "")
        formData.append("waterAccess", editingItem.waterAccess || "none")
        formData.append("electricityAccess", editingItem.electricityAccess?.toString() || "false")
        formData.append("roadAccess", editingItem.roadAccess?.toString() || "false")
        formData.append("type", editingItem.type || "sale")
        formData.append("description", editingItem.description || "")
        formData.append("city", editingItem.city || "")
        formData.append("region", editingItem.region || "")
        formData.append("address", editingItem.address || "")
        formData.append("kebele", editingItem.kebele || "")
        formData.append("owner", editingItem.owner || "")
        formData.append("status", editingItem.status || "available")
      } else if (selectedCategory === "machines") {
        // Machine-specific fields
        formData.append("title", editingItem.title || "")
        formData.append("category", editingItem.category || "")
        formData.append("brand", editingItem.brand || "")
        formData.append("model", editingItem.model || "")
        formData.append("price", editingItem.price?.toString() || "0")
        formData.append("year", editingItem.yearManufactured?.toString() || "")
        formData.append("hoursUsed", editingItem.hoursUsed?.toString() || "0")
        formData.append("type", editingItem.type || "sale")
        formData.append("condition", editingItem.condition || "used")
        formData.append("description", editingItem.description || "")
        formData.append("city", editingItem.city || "")
        formData.append("region", editingItem.region || "")
        formData.append("address", editingItem.address || "")
        formData.append("kebele", editingItem.kebele || "")
        formData.append("owner", editingItem.owner || "")
        formData.append("status", editingItem.status || "available")

        // Add specifications as JSON string
        if (editingItem.specifications && editingItem.specifications.length > 0) {
          formData.append("specifications", JSON.stringify(editingItem.specifications))
        }
      }

      // Add image files for all categories
      if (uploadedImages && uploadedImages.length > 0) {
        uploadedImages.forEach((imageFile, index) => {
          if (imageFile instanceof File) {
            formData.append("images", imageFile)
          }
        })
      }

      console.log("[v0] FormData entries:")
      for (const [key, value] of formData.entries()) {
        console.log(`[v0] ${key}:`, value)
      }

      const baseUrl = "https://car-house-land.onrender.com/api"
      let apiEndpoint = ""

      switch (selectedCategory) {
        case "cars":
          apiEndpoint = "cars"
          break
        case "houses":
          apiEndpoint = "properties" // Assuming houses use properties endpoint
          break
        case "lands":
          apiEndpoint = "lands"
          break
        case "machines":
          apiEndpoint = "machines"
          break
        default:
          throw new Error(`Unknown category: ${selectedCategory}`)
      }

      const url = editingItem.id ? `${baseUrl}/${apiEndpoint}/${editingItem.id}` : `${baseUrl}/${apiEndpoint}`

      const method = editingItem.id ? "PUT" : "POST"

      console.log(`[v0] Making API request:`, method, url)

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData,
      })

      console.log(`[v0] ${selectedCategory} save response status:`, response.status)

      if (response.ok) {
        const result = await response.json()
        console.log(`[v0] ${selectedCategory} saved successfully:`, result)

        // Close dialog and reset form
        setIsDialogOpen(false)
        setEditingItem(null)
        setUploadedImages([])

        // Refresh listings if needed
        // fetchListings(); // Implement this if you have a listings fetch function
      } else {
        const errorData = await response.json().catch(() => null)
        const errorText = await response.text().catch(() => "Unknown error")

        console.error(`[v0] Failed to save ${selectedCategory}:`, {
          status: response.status,
          statusText: response.statusText,
          errorData,
          errorText,
        })

        // Show user-friendly error message
        alert(`Failed to save ${selectedCategory}: ${errorData?.message || errorText || "Unknown error"}`)
      }
    } catch (error) {
      console.error(`[v0] Error saving ${selectedCategory}:`, error)
      alert(`Failed to save ${selectedCategory}. Please try again.`)
    }
  }

  const handleViewDeal = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsDealDetailOpen(true)
  }

  const handleAcceptDeal = async (dealId: string) => {
    try {
      await updateDealStatus(dealId, "approved")
      // Refresh deals to get updated data
      await refreshDeals()
    } catch (error) {
      console.error("Error accepting deal:", error)
    }
  }

  const handleRejectDeal = async (dealId: string) => {
    try {
      await updateDealStatus(dealId, "rejected")
      await refreshDeals()
    } catch (error) {
      console.error("Error rejecting deal:", error)
    }
  }

  const handleCompleteDeal = async (dealId: string) => {
    try {
      await updateDealStatus(dealId, "completed")
      await refreshDeals()
    } catch (error) {
      console.error("Error completing deal:", error)
    }
  }

  const handleCancelDeal = async (dealId: string, reason?: string) => {
    try {
      await updateDealStatus(dealId, "cancelled", reason)
      await refreshDeals()
    } catch (error) {
      console.error("Error cancelling deal:", error)
    }
  }

  const handleIncompleteDeal = (dealId: string) => {
    if (confirm("Mark this deal as incomplete? This indicates the deal did not go through.")) {
      updateDealStatus(dealId, "incomplete")
    }
  }

  const getStatusIcon = (status: Deal["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "accepted":
        return <CheckCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "incomplete":
        return <AlertCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: Deal["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "accepted":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "incomplete":
        return "bg-red-100 text-red-800 border-red-200"
      case "rejected":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const getItemIcon = (itemType: Deal["itemType"]) => {
    switch (itemType) {
      case "car":
        return <Car className="w-5 h-5" />
      case "house":
        return <Home className="w-5 h-5" />
      case "land":
        return <MapPin className="w-5 h-5" />
      case "machine":
        return <Wrench className="w-5 h-5" />
      default:
        return <Car className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text-brand">Admin Insights</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Your business at a glance - data-driven decisions made simple
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              {pendingDeals > 0 && (
                <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-lg px-3 sm:px-4 py-2 animate-pulse">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  <span className="text-xs sm:text-sm font-medium text-amber-800">
                    {pendingDeals} new deal{pendingDeals > 1 ? "s" : ""} pending
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-transparent text-xs sm:text-sm px-2 sm:px-3"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2 bg-transparent text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-l-4 border-l-brand-blue hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-brand-blue transition-colors">
                    {totalListings}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Total Listings</div>
                  <div className="flex items-center mt-2 text-green-600">
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="text-xs font-medium">+12% from last month</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                  <Package className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-brand-blue" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-brand-purple hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-brand-purple transition-colors">
                    {activeUsers}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Active Users</div>
                  <div className="flex items-center mt-2 text-green-600">
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="text-xs font-medium">+8% from last month</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                  <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-brand-purple" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-brand-orange hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-brand-orange transition-colors">
                    ETB {(totalRevenue || 0).toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Total Revenue</div>
                  <div className="flex items-center mt-2 text-green-600">
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="text-xs font-medium">+15% from last month</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                  <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-brand-orange" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {pendingDeals}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Pending Deals</div>
                  <div className="flex items-center mt-2 text-amber-600">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="text-xs font-medium">Requires attention</span>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6 sm:mb-8">
            <div className="flex overflow-x-auto scrollbar-hide">
              <TabsList className="grid grid-cols-5 w-full min-w-max sm:min-w-0">
                <TabsTrigger
                  value="overview"
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4"
                >
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Over</span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4"
                >
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger
                  value="listings"
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4"
                >
                  <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Listings</span>
                  <span className="sm:hidden">List</span>
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Users</span>
                  <span className="sm:hidden">User</span>
                </TabsTrigger>
                <TabsTrigger
                  value="deals"
                  className="relative flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-4"
                >
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Deals</span>
                  <span className="sm:hidden">Deal</span>
                  {pendingDeals > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-500 text-white border-0">
                      {pendingDeals}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center text-sm sm:text-base">
                    <PieChart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-brand-blue" />
                    Listings Distribution
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      cars: { label: "Cars", color: "var(--color-cars-primary)" },
                      houses: { label: "Houses", color: "var(--color-houses-primary)" },
                      lands: { label: "Lands", color: "var(--color-lands-primary)" },
                      machines: { label: "Machines", color: "var(--color-machines-primary)" },
                    }}
                    className="h-[200px] sm:h-[250px] md:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius="80%"
                          dataKey="value"
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center text-sm sm:text-base">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-brand-purple" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    {performanceData.map((metric, index) => (
                      <div key={index} className="text-center">
                        <ChartContainer
                          config={{
                            value: { label: metric.name, color: metric.color },
                          }}
                          className="h-[80px] sm:h-[100px] md:h-[120px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[metric]}>
                              <RadialBar dataKey="value" cornerRadius={10} fill={metric.color} />
                            </RadialBarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                        <div className="mt-2">
                          <div className="text-xl sm:text-2xl font-bold" style={{ color: metric.color }}>
                            {metric.value}%
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">{metric.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center text-sm sm:text-base">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-brand-orange" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Latest platform updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { type: "user", message: "New user registration", time: "2 hours ago", color: "bg-blue-500" },
                      { type: "listing", message: "Car listing approved", time: "4 hours ago", color: "bg-green-500" },
                      {
                        type: "deal",
                        message: "Deal completed successfully",
                        time: "6 hours ago",
                        color: "bg-purple-500",
                      },
                      {
                        type: "system",
                        message: "System maintenance completed",
                        time: "8 hours ago",
                        color: "bg-orange-500",
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 sm:space-x-4 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${activity.color}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium truncate">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center text-sm sm:text-base">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-amber-500" />
                    Top Performing Items
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Most viewed and inquired items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {topPerformingItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-xs sm:text-sm truncate">{item.name}</span>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {item.category}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-4 mt-1 text-xs text-gray-600">
                            <span>{item.views} views</span>
                            <span>{item.inquiries} inquiries</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="font-semibold text-brand-blue text-xs sm:text-sm">
                            ETB {(item.revenue || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center text-sm sm:text-base">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-brand-blue" />
                    Revenue Trends
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Monthly revenue growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Revenue",
                        color: "var(--color-brand-blue)",
                      },
                    }}
                    className="h-[200px] sm:h-[250px] md:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-brand-blue)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-brand-blue)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name || "Revenue"]}
                            />
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--color-brand-blue)"
                          strokeWidth={3}
                          fill="url(#revenueGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center text-sm sm:text-base">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-brand-purple" />
                    User Growth
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Monthly active users</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      users: {
                        label: "Active Users",
                        color: "var(--color-brand-purple)",
                      },
                    }}
                    className="h-[200px] sm:h-[250px] md:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value, name) => [Number(value).toLocaleString(), name || "Users"]}
                            />
                          }
                        />
                        <Bar dataKey="users" fill="var(--color-brand-purple)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center text-sm sm:text-base">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-brand-orange" />
                    Daily Traffic
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Visitors and page views throughout the day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      visitors: {
                        label: "Visitors",
                        color: "var(--color-brand-orange)",
                      },
                      pageViews: {
                        label: "Page Views",
                        color: "var(--color-brand-blue)",
                      },
                    }}
                    className="h-[200px] sm:h-[250px] md:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trafficData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value, name) => [Number(value).toLocaleString(), name || "Count"]}
                            />
                          }
                        />
                        <Line type="monotone" dataKey="visitors" stroke="var(--color-brand-orange)" strokeWidth={3} />
                        <Line type="monotone" dataKey="pageViews" stroke="var(--color-brand-blue)" strokeWidth={3} />
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="flex items-center text-sm sm:text-base">
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-600" />
                    Deal Completion Rate
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Monthly deal success metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      deals: {
                        label: "Completed Deals",
                        color: "#10b981",
                      },
                    }}
                    className="h-[200px] sm:h-[250px] md:h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value, name) => [Number(value).toLocaleString(), name || "Deals"]}
                            />
                          }
                        />
                        <Bar dataKey="deals" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ... existing code for other tabs ... */}
          <TabsContent value="listings" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 sm:pb-4">
                <CardTitle className="text-sm sm:text-base">Manage Listings</CardTitle>
                <div className="flex items-stretch justify-start flex-wrap gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cars">Cars</SelectItem>
                      <SelectItem value="houses">Houses</SelectItem>
                      <SelectItem value="lands">Lands</SelectItem>
                      <SelectItem value="machines">Machines</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-brand-blue hover:bg-brand-blue/90 text-xs sm:text-sm">
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    {/* Made dialog responsive */}
                    <DialogContent className="max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
                      <DialogHeader>
                        <DialogTitle className="text-sm sm:text-base">
                          {editingItem ? "Edit" : "Add New"} {selectedCategory.slice(0, -1)}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Title</Label>
                              <Input
                                value={editingItem?.title || ""}
                                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Price</Label>
                              <Input
                                type="number"
                                value={editingItem?.price || ""}
                                onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">Listing Type</Label>
                              <Select
                                value={editingItem?.type || "sale"}
                                onValueChange={(value) => setEditingItem({ ...editingItem, type: value })}
                              >
                                <SelectTrigger className="text-xs sm:text-sm">
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
                          </div>

                          {selectedCategory === "machines" && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-medium">Owner *</Label>
                                <Select
                                  value={editingItem?.owner || ""}
                                  onValueChange={(value) => setEditingItem({ ...editingItem, owner: value })}
                                >


                                  <SelectTrigger className="text-xs sm:text-sm">
                                    <SelectValue placeholder="Select owner" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {owners.map((owner) => (
                                      <SelectItem key={owner._id} value={owner._id}>
                                        {owner.fullName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">City *</Label>
                                  <Input
                                    value={editingItem?.city || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, city: e.target.value })}
                                    className="text-sm"
                                    placeholder="Addis Ababa"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Region *</Label>
                                  <Input
                                    value={editingItem?.region || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, region: e.target.value })}
                                    className="text-sm"
                                    placeholder="Addis Ababa"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Address *</Label>
                                  <Input
                                    value={editingItem?.address || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, address: e.target.value })}
                                    className="text-sm"
                                    placeholder="Bole, Megenagna"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Kebele</Label>
                                  <Input
                                    value={editingItem?.kebele || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, kebele: e.target.value })}
                                    className="text-sm"
                                    placeholder="01"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-medium">Category *</Label>
                                <Select
                                  value={editingItem?.category || ""}
                                  onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                                >
                                  <SelectTrigger className="text-xs sm:text-sm">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="electronics">Electronics</SelectItem>
                                    <SelectItem value="appliances">Appliances</SelectItem>
                                    <SelectItem value="industrial">Industrial</SelectItem>
                                    <SelectItem value="agricultural">Agricultural</SelectItem>
                                    <SelectItem value="construction">Construction</SelectItem>
                                    <SelectItem value="medical">Medical</SelectItem>
                                    <SelectItem value="automotive">Automotive</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-medium">Type *</Label>
                                <Select
                                  value={editingItem?.type || ""}
                                  onValueChange={(value) => setEditingItem({ ...editingItem, type: value })}
                                >
                                  <SelectTrigger className="text-xs sm:text-sm">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sale">Sale</SelectItem>
                                    <SelectItem value="rent">Rent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Brand *</Label>
                                  <Input
                                    value={editingItem?.brand || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
                                    className="text-sm"
                                    placeholder="e.g., Caterpillar, John Deere"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Model</Label>
                                  <Input
                                    value={editingItem?.model || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, model: e.target.value })}
                                    className="text-sm"
                                    placeholder="e.g., 320D, 850K"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Year Manufactured</Label>
                                  <Input
                                    type="number"
                                    value={editingItem?.yearManufactured || ""}
                                    onChange={(e) =>
                                      setEditingItem({ ...editingItem, yearManufactured: Number(e.target.value) })
                                    }
                                    className="text-sm"
                                    placeholder="2020"
                                    min="1990"
                                    max={new Date().getFullYear()}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Subcategory</Label>
                                  <Input
                                    value={editingItem?.subcategory || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, subcategory: e.target.value })}
                                    className="text-sm"
                                    placeholder="e.g., Excavator, Tractor"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Condition *</Label>
                                  <Select
                                    value={editingItem?.condition || "used"}
                                    onValueChange={(value) => setEditingItem({ ...editingItem, condition: value })}
                                  >
                                    <SelectTrigger className="text-xs sm:text-sm">
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
                            </>
                          )}

                          {selectedCategory === "cars" && (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Make *</Label>
                                  <Input
                                    value={editingItem?.make || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, make: e.target.value })}
                                    className="text-sm"
                                    placeholder="Toyota, BMW, Mercedes"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Model *</Label>
                                  <Input
                                    value={editingItem?.model || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, model: e.target.value })}
                                    className="text-sm"
                                    placeholder="Camry, X5, C-Class"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Type *</Label>
                                  <Select
                                    value={editingItem?.type || "sale"}
                                    onChange={(value) => setEditingItem({ ...editingItem, type: value })}
                                  >
                                    <SelectTrigger className="text-xs sm:text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="sale">For Sale</SelectItem>
                                      <SelectItem value="rent">For Rent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Year</Label>
                                  <Input
                                    type="number"
                                    value={editingItem?.year || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, year: Number(e.target.value) })}
                                    className="text-sm"
                                    placeholder="2020"
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Mileage</Label>
                                  <Input
                                    type="number"
                                    value={editingItem?.mileage || ""}
                                    onChange={(e) =>
                                      setEditingItem({ ...editingItem, mileage: Number(e.target.value) })
                                    }
                                    className="text-sm"
                                    placeholder="50000"
                                    min="0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Color *</Label>
                                  <Input
                                    value={editingItem?.color || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                                    className="text-sm"
                                    placeholder="Red, Blue, Black"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Fuel Type *</Label>
                                  <Select
                                    value={editingItem?.fuelType || "gasoline"}
                                    onChange={(value) => setEditingItem({ ...editingItem, fuelType: value })}
                                  >
                                    <SelectTrigger className="text-xs sm:text-sm">
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
                                {/* Adding Condition field for new/used selection */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm font-medium">Condition *</Label>
                                    <Select
                                      value={editingItem?.condition || "used"}
                                      onChange={(value) => setEditingItem({ ...editingItem, condition: value })}
                                    >
                                      <SelectTrigger className="text-xs sm:text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="used">Used</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs sm:text-sm font-medium">Transmission *</Label>
                                    <Select
                                      value={editingItem?.transmission || "manual"}
                                      onChange={(value) => setEditingItem({ ...editingItem, transmission: value })}
                                    >
                                      <SelectTrigger className="text-xs sm:text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="manual">Manual</SelectItem>
                                        <SelectItem value="automatic">Automatic</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-medium">Body Type *</Label>
                                <Select
                                  value={editingItem?.bodyType || "sedan"}
                                  onChange={(value) => setEditingItem({ ...editingItem, bodyType: value })}
                                >
                                  <SelectTrigger className="text-xs sm:text-sm">
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

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">City *</Label>
                                  <Input
                                    value={editingItem?.city || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, city: e.target.value })}
                                    className="text-sm"
                                    placeholder="Addis Ababa"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Region *</Label>
                                  <Input
                                    value={editingItem?.region || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, region: e.target.value })}
                                    className="text-sm"
                                    placeholder="Addis Ababa"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Address *</Label>
                                  <Input
                                    value={editingItem?.address || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, address: e.target.value })}
                                    className="text-sm"
                                    placeholder="Bole, Megenagna"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Kebele</Label>
                                  <Input
                                    value={editingItem?.kebele || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, kebele: e.target.value })}
                                    className="text-sm"
                                    placeholder="01"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Owner *</Label>
                                  <Select
                                    value={editingItem?.owner || ""}
                                   onValueChange={(value) => setEditingItem({ ...editingItem, owner: value })} // Use onValueChange
                                  >
                                    <SelectTrigger className="text-xs sm:text-sm">
                                      <SelectValue
                                        placeholder={isLoadingOwners ? "Loading owners..." : "Select owner"}
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {isLoadingOwners ? (
                                        <SelectItem value="" disabled>
                                          Loading owners...
                                        </SelectItem>
                                      ) : owners.length === 0 ? (
                                        <SelectItem value="" disabled>
                                          No owners available
                                        </SelectItem>
                                      ) : (
                                        owners.map((owner) => (
                                          <SelectItem key={owner._id} value={owner._id}>
                                            {owner.fullName}
                                          </SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Status</Label>
                                  <Select
                                    value={editingItem?.status || "available"}
                                    onChange={(value) => setEditingItem({ ...editingItem, status: value })}
                                  >
                                    <SelectTrigger className="text-xs sm:text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="available">Available</SelectItem>
                                      <SelectItem value="sold">Sold</SelectItem>
                                      <SelectItem value="rented">Rented</SelectItem>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-medium">Features</Label>
                                <Input
                                  value={editingItem?.features?.join(", ") || ""}
                                  onChange={(e) =>
                                    setEditingItem({
                                      ...editingItem,
                                      features: e.target.value
                                        .split(",")
                                        .map((f) => f.trim())
                                        .filter((f) => f),
                                    })
                                  }
                                  className="text-sm"
                                  placeholder="Air Conditioning, GPS, Leather Seats (comma separated)"
                                />
                              </div>
                            </>
                          )}

                          {selectedCategory === "houses" && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-medium">Owner *</Label>
                                <Select
                                  value={editingItem?.owner || ""}
                                  onValueChange={(value) => setEditingItem({ ...editingItem, owner: value })}
                                >
                                  <SelectTrigger className="text-xs sm:text-sm">
                                    <SelectValue placeholder="Select owner" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {owners.map((owner) => (
                                      <SelectItem key={owner._id} value={owner._id}>
                                        {owner.fullName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">City *</Label>
                                  <Input
                                    value={editingItem?.city || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, city: e.target.value })}
                                    className="text-sm"
                                    placeholder="Addis Ababa"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Region *</Label>
                                  <Input
                                    value={editingItem?.region || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, region: e.target.value })}
                                    className="text-sm"
                                    placeholder="Addis Ababa"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Address *</Label>
                                  <Input
                                    value={editingItem?.address || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, address: e.target.value })}
                                    className="text-sm"
                                    placeholder="Bole, Megenagna"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Kebele</Label>
                                  <Input
                                    value={editingItem?.kebele || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, kebele: e.target.value })}
                                    className="text-sm"
                                    placeholder="01"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-medium">Type *</Label>
                                <Select
                                  value={editingItem?.type || ""}
                                  onValueChange={(value) => setEditingItem({ ...editingItem, type: value })}
                                >
                                  <SelectTrigger className="text-xs sm:text-sm">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sale">Sale</SelectItem>
                                    <SelectItem value="rent">Rent</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Bedrooms *</Label>
                                  <Input
                                    type="number"
                                    value={editingItem?.bedrooms || ""}
                                    onChange={(e) =>
                                      setEditingItem({ ...editingItem, bedrooms: Number(e.target.value) })
                                    }
                                    className="text-sm"
                                    placeholder="3"
                                    min="0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Bathrooms *</Label>
                                  <Input
                                    type="number"
                                    value={editingItem?.bathrooms || ""}
                                    onChange={(e) =>
                                      setEditingItem({ ...editingItem, bathrooms: Number(e.target.value) })
                                    }
                                    className="text-sm"
                                    placeholder="2"
                                    min="0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Size *</Label>
                                  <Input
                                    value={editingItem?.size || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, size: e.target.value })}
                                    className="text-sm"
                                    placeholder="150 sqm"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Property Type *</Label>
                                  <Select
                                    value={editingItem?.propertyType || ""}
                                    onChange={(value) => setEditingItem({ ...editingItem, propertyType: value })}
                                  >
                                    <SelectTrigger className="text-xs sm:text-sm">
                                      <SelectValue placeholder="Select property type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="house">House</SelectItem>
                                      <SelectItem value="apartment">Apartment</SelectItem>
                                      <SelectItem value="condo">Condo</SelectItem>
                                      <SelectItem value="villa">Villa</SelectItem>
                                      <SelectItem value="commercial">Commercial</SelectItem>
                                      <SelectItem value="office">Office</SelectItem>
                                      <SelectItem value="warehouse">Warehouse</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Year Built</Label>
                                  <Input
                                    type="number"
                                    value={editingItem?.yearBuilt || ""}
                                    onChange={(e) =>
                                      setEditingItem({ ...editingItem, yearBuilt: Number(e.target.value) })
                                    }
                                    className="text-sm"
                                    placeholder="2015"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Floors</Label>
                                  <Input
                                    type="number"
                                    value={editingItem?.floors || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, floors: Number(e.target.value) })}
                                    className="text-sm"
                                    placeholder="2"
                                    min="1"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Parking Spaces</Label>
                                  <Input
                                    type="number"
                                    value={editingItem?.parkingSpaces || ""}
                                    onChange={(e) =>
                                      setEditingItem({ ...editingItem, parkingSpaces: Number(e.target.value) })
                                    }
                                    className="text-sm"
                                    placeholder="1"
                                    min="0"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {selectedCategory === "lands" && (
                            <>
                              <div className="space-y-2">
                                <Label className="text-xs sm:text-sm font-medium">Owner *</Label>
                                <Select
                                  value={editingItem?.owner || ""}
                                  onValueChange={(value) => setEditingItem({ ...editingItem, owner: value })}
                                >
                                  <SelectTrigger className="text-xs sm:text-sm">
                                    <SelectValue placeholder="Select owner" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {owners.map((owner) => (
                                      <SelectItem key={owner._id} value={owner._id}>
                                        {owner.fullName}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Size Value *</Label>
                                  <Input
                                    type="number"
                                    value={editingItem?.sizeValue || ""}
                                    onChange={(e) =>
                                      setEditingItem({ ...editingItem, sizeValue: Number(e.target.value) })
                                    }
                                    className="text-sm"
                                    placeholder="5.5"
                                    min="0.1"
                                    step="0.1"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Size Unit</Label>
                                  <Select
                                    value={editingItem?.sizeUnit || "hectare"}
                                    onValueChange={(value) => setEditingItem({ ...editingItem, sizeUnit: value })}
                                  >
                                    <SelectTrigger className="text-xs sm:text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="hectare">Hectare</SelectItem>
                                      <SelectItem value="acre">Acre</SelectItem>
                                      <SelectItem value="sqm">Square Meters</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Zoning *</Label>
                                  <Select
                                    value={editingItem?.zoning || ""}
                                    onValueChange={(value) => setEditingItem({ ...editingItem, zoning: value })}
                                  >
                                    <SelectTrigger className="text-xs sm:text-sm">
                                      <SelectValue placeholder="Select zoning" />
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
                                  <Label className="text-xs sm:text-sm font-medium">Land Use *</Label>
                                  <Select
                                    value={editingItem?.landUse || ""}
                                    onValueChange={(value) => setEditingItem({ ...editingItem, landUse: value })}
                                  >
                                    <SelectTrigger className="text-xs sm:text-sm">
                                      <SelectValue placeholder="Select land use" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="development">Development</SelectItem>
                                      <SelectItem value="farming">Farming</SelectItem>
                                      <SelectItem value="commercial">Commercial</SelectItem>
                                      <SelectItem value="recreation">Recreation</SelectItem>
                                      <SelectItem value="vineyard">Vineyard</SelectItem>
                                      <SelectItem value="mining">Mining</SelectItem>
                                      <SelectItem value="tourism">Tourism</SelectItem>
                                      <SelectItem value="technology">Technology</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Topography *</Label>
                                  <Select
                                    value={editingItem?.topography || ""}
                                    onValueChange={(value) => setEditingItem({ ...editingItem, topography: value })}
                                  >
                                    <SelectTrigger className="text-xs sm:text-sm">
                                      <SelectValue placeholder="Select topography" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="flat">Flat</SelectItem>
                                      <SelectItem value="hilly">Hilly</SelectItem>
                                      <SelectItem value="mountainous">Mountainous</SelectItem>
                                      <SelectItem value="rolling">Rolling</SelectItem>
                                      <SelectItem value="desert">Desert</SelectItem>
                                      <SelectItem value="sloped">Sloped</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Water Access</Label>
                                  <Select
                                    value={editingItem?.waterAccess || "none"}
                                    onValueChange={(value) => setEditingItem({ ...editingItem, waterAccess: value })}
                                  >
                                    <SelectTrigger className="text-xs sm:text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">None</SelectItem>
                                      <SelectItem value="well">Well</SelectItem>
                                      <SelectItem value="river">River</SelectItem>
                                      <SelectItem value="lake">Lake</SelectItem>
                                      <SelectItem value="municipal">Municipal</SelectItem>
                                      <SelectItem value="borehole">Borehole</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">City *</Label>
                                  <Input
                                    value={editingItem?.city || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, city: e.target.value })}
                                    className="text-sm"
                                    placeholder="Addis Ababa"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Region *</Label>
                                  <Input
                                    value={editingItem?.region || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, region: e.target.value })}
                                    className="text-sm"
                                    placeholder="Addis Ababa"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Address *</Label>
                                  <Input
                                    value={editingItem?.address || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, address: e.target.value })}
                                    className="text-sm"
                                    placeholder="Bole, Megenagna"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Zone</Label>
                                  <Input
                                    value={editingItem?.zone || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, zone: e.target.value })}
                                    className="text-sm"
                                    placeholder="Zone name"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                  <Label className="text-xs sm:text-sm font-medium">Kebele</Label>
                                  <Input
                                    value={editingItem?.kebele || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, kebele: e.target.value })}
                                    className="text-sm"
                                    placeholder="Kebele name"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {/* Adding Description field with character count */}
                          <div className="space-y-2">
                            <Label className="text-xs sm:text-sm font-medium">Description * (20-1000 characters)</Label>
                            <Textarea
                              value={editingItem?.description || ""}
                              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                              rows={4}
                              className="text-sm"
                              placeholder="Enter a detailed description (minimum 20 characters)"
                              minLength={20}
                              maxLength={1000}
                            />
                            <div className="text-xs text-gray-500">
                              {(editingItem?.description || "").length}/1000 characters
                              {(editingItem?.description || "").length < 20 && (
                                <span className="text-red-500 ml-2">Minimum 20 characters required</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                          <div className="space-y-2">
                            <Label className="text-xs sm:text-sm font-medium">Images</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-5 md:p-6 text-center hover:border-gray-400 transition-colors">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                              />
                              <label htmlFor="image-upload" className="cursor-pointer">
                                <div className="space-y-2">
                                  <Upload className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400 mx-auto" />
                                  <div className="text-xs sm:text-sm text-gray-600">
                                    <span className="font-medium text-brand-blue hover:text-brand-blue/80">
                                      Click to upload
                                    </span>{" "}
                                    or drag and drop
                                  </div>
                                  <div className="text-xxs sm:text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</div>
                                </div>
                              </label>
                            </div>
                          </div>

                          {uploadedImages.length > 0 && (
                            <div className="space-y-2">
                              <Label className="text-xs sm:text-sm font-medium">
                                Uploaded Images ({uploadedImages.length})
                              </Label>
                              <div className="grid grid-cols-2 gap-2 sm:gap-3 max-h-40 sm:max-h-52 md:max-h-64 overflow-y-auto">
                                {uploadedImages.map((image, index) => (
                                  <div key={index} className="relative group">
                                    <div className="aspect-square relative overflow-hidden rounded-lg border">
                                      <img
                                        src={
                                          image instanceof File
                                            ? URL.createObjectURL(image)
                                            : image || "/placeholder.svg"
                                        }
                                        alt={`Upload ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onLoad={(e) => {
                                          if (image instanceof File) {
                                            const img = e.target as HTMLImageElement
                                            setTimeout(() => URL.revokeObjectURL(img.src), 1000)
                                          }
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="absolute top-1 right-1 h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeImage(index)}
                                      >
                                        <X className="w-2 h-2 sm:w-3 sm:h-3" />
                                      </Button>
                                    </div>
                                    {index === 0 && (
                                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                                        <Badge className="text-xxs sm:text-xs bg-brand-blue text-white">Main</Badge>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {uploadedImages.length === 0 && (
                                <div className="text-center py-4 sm:py-6 text-gray-500">
                                  <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-gray-300" />
                                  <p className="text-xs sm:text-sm">No images uploaded yet</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4 sm:mt-6">
                        <Button
                          variant="outline"
                          className="text-xs sm:text-sm bg-transparent"
                          onClick={() => {
                            setIsDialogOpen(false)
                            setUploadedImages([])
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSave}
                          className="bg-brand-blue hover:bg-brand-blue/90 text-xs sm:text-sm"
                        >
                          Save
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Title</TableHead>
                      <TableHead className="text-xs sm:text-sm">Price</TableHead>
                      <TableHead className="text-xs sm:text-sm">Location</TableHead>
                      <TableHead className="text-xs sm:text-sm">Type</TableHead>
                      <TableHead className="text-xs sm:text-sm">Posted Date</TableHead>
                      <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentData()
                      .slice(0, 10)
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">{item.title}</TableCell>
                          <TableCell className="text-xs sm:text-sm">ETB {(item.price || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{item.location}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge variant={item.listingType === "sale" ? "default" : "secondary"}>
                              {item.listingType === "sale" ? "For Sale" : "For Rent"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs sm:text-sm bg-transparent"
                                onClick={() => handleView(item)}
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs sm:text-sm bg-transparent"
                                onClick={() => handleEdit(item)}
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs sm:text-sm bg-transparent"
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 sm:pb-4">
                <CardTitle className="flex items-center text-sm sm:text-base">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-brand-purple" />
                  User Management
                </CardTitle>
                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-brand-purple hover:bg-brand-purple/90 text-xs sm:text-sm"
                      onClick={() => setEditingUser(null)}
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-xs sm:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-sm sm:text-base">
                        {editingUser ? "Edit User" : "Add New User"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Full Name *</label>
                        <Input
                          value={editingUser?.fullName || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                          className="text-sm"
                          placeholder="Enter full name"
                          maxLength={80}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Email *</label>
                        <Input
                          type="email"
                          value={editingUser?.email || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                          className="text-sm"
                          placeholder="Enter email address"
                        />
                      </div>

                      {!editingUser?._id && (
                        <div className="space-y-2">
                          <label className="text-xs sm:text-sm font-medium">Password *</label>
                          <Input
                            type="password"
                            value={editingUser?.password || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                            className="text-sm"
                            placeholder="Enter password (min 6 characters)"
                            minLength={6}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Phone *</label>
                        <Input
                          type="tel"
                          value={editingUser?.phone || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                          className="text-sm"
                          placeholder="+251xxxxxxxxx"
                          pattern="^\+251\d{9}$"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Role</label>
                        <Select
                          value={editingUser?.role || "user"}
                          onChange={(value) => setEditingUser({ ...editingUser, role: value })}
                        >
                          <SelectTrigger className="text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Avatar URL</label>
                        <Input
                          type="url"
                          value={editingUser?.avatar || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, avatar: e.target.value })}
                          className="text-sm"
                          placeholder="Enter avatar image URL"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Street Address</label>
                        <Input
                          value={editingUser?.street || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, street: e.target.value })}
                          className="text-sm"
                          placeholder="Enter street address"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium">City</label>
                        <Input
                          value={editingUser?.city || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })}
                          className="text-sm"
                          placeholder="Enter city"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Region</label>
                        <Input
                          value={editingUser?.region || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, region: e.target.value })}
                          className="text-sm"
                          placeholder="Enter region"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Country</label>
                        <Input
                          value={editingUser?.country || "ETHIOPIA"}
                          onChange={(e) => setEditingUser({ ...editingUser, country: e.target.value.toUpperCase() })}
                          className="text-sm"
                          placeholder="Enter country"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Status</label>
                        <Select
                          value={
                            editingUser?.isActive !== undefined
                              ? editingUser.isActive
                                ? "active"
                                : "inactive"
                              : "active"
                          }
                          onChange={(value) => setEditingUser({ ...editingUser, isActive: value === "active" })}
                        >
                          <SelectTrigger className="text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium">Verification Status</label>
                        <Select
                          value={
                            editingUser?.isVerified !== undefined
                              ? editingUser.isVerified
                                ? "verified"
                                : "unverified"
                              : "unverified"
                          }
                          onChange={(value) => setEditingUser({ ...editingUser, isVerified: value === "verified" })}
                        >
                          <SelectTrigger className="text-xs sm:text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="unverified">Unverified</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-6">
                      <Button
                        variant="outline"
                        className="text-xs sm:text-sm bg-transparent"
                        onClick={() => setIsUserDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveUser}
                        className="bg-brand-purple hover:bg-brand-purple/90 text-xs sm:text-sm"
                      >
                        Save
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-gray-500">Loading users...</div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Name</TableHead>
                        <TableHead className="text-xs sm:text-sm">Email</TableHead>
                        <TableHead className="text-xs sm:text-sm">Role</TableHead>
                        <TableHead className="text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="text-xs sm:text-sm">Verified</TableHead>
                        <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.slice(0, 10).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">{user.name}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{user.email}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <Badge variant={user.isVerified ? "default" : "secondary"}>
                              {user.isVerified ? "Verified" : "Unverified"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs sm:text-sm bg-transparent"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs sm:text-sm bg-transparent"
                                onClick={() => toggleUserStatus(user.id)}
                              >
                                {user.status === "active" ? "Deactivate" : "Activate"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deals" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="flex items-center text-sm sm:text-base">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-emerald-600" />
                  Deal Management
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Review and manage all platform deals</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Deal ID</TableHead>
                      <TableHead className="text-xs sm:text-sm">Item</TableHead>
                      <TableHead className="text-xs sm:text-sm">Buyer</TableHead>
                      <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm">Date</TableHead>
                      <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deals.slice(0, 10).map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell className="text-xs sm:text-sm font-mono">
                          {deal.dealId || deal.id.slice(-8)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <div className="flex items-center space-x-2">
                            {getItemIcon(deal.itemType)}
                            <span className="font-medium">{deal.item.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
  <div>
    <p className="font-medium">
      {deal.buyer && deal.buyer.fullName ? deal.buyer.fullName : "N/A"}
    </p>
    <p className="text-gray-500">
      {deal.buyer && deal.buyer.email ? deal.buyer.email : "N/A"}
    </p>
  </div>
</TableCell>
                        <TableCell className="text-xs sm:text-sm font-medium">
                          ETB {(deal.originalPrice || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(deal.status)} text-xs flex items-center space-x-1`}>
                            {getStatusIcon(deal.status)}
                            <span>{deal.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {new Date(deal.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs bg-transparent"
                              onClick={() => handleViewDeal(deal)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            {deal.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="text-xs bg-green-600 hover:bg-green-700"
                                  onClick={() => handleAcceptDeal(deal.id)}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="text-xs"
                                  onClick={() => handleRejectDeal(deal.id)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {deal.status === "approved" && (
                              <Button
                                size="sm"
                                className="text-xs bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleCompleteDeal(deal.id)}
                              >
                                Complete
                              </Button>
                            )}
                            {(deal.status === "pending" || deal.status === "approved") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs text-red-600 hover:text-red-700 bg-transparent"
                                onClick={() => handleCancelDeal(deal.id, "Cancelled by admin")}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
