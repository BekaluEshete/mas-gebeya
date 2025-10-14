"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Settings, User, Loader2 } from "lucide-react"
import { useApp } from "@/context/app-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { authService } from "@/lib/auth"

export function UserDashboard() {
  const { user, favorites, setIsAuthModalOpen, removeFromFavorites } = useApp()
  const [activeTab, setActiveTab] = useState("saved")
  const [editForm, setEditForm] = useState({ fullName: user?.fullName || "" })
  const [isLoading, setIsLoading] = useState(false)
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
      // Read the response as JSON directly
      const data = await response.json()
      console.log("Response data:", data)

      if (response.ok) {
        const updatedUser = data // Use the parsed data directly
        console.log("Profile updated successfully:", updatedUser)
        alert("Profile updated successfully!")
        // Optionally update the user state in context if supported by useApp
        // e.g., dispatch({ type: "UPDATE_USER", payload: updatedUser })
      } else {
        const errorMsg = data.message || "Unknown error"
        if (response.status === 403 && errorMsg.includes("Admin privileges required")) {
          throw new Error("You do not have permission to update your profile. An admin account is required.")
        }
        throw new Error(`Failed to update profile: ${response.status} - ${errorMsg}`)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      const errorMsg = error instanceof Error ? error.message : "Failed to update profile. Please try again."
      alert(errorMsg)
    } finally {
      setIsLoading(false)
    }
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
            <TabsList className="grid w-full grid-cols-2 bg-blue-50 rounded-xl p-1">
              <TabsTrigger
                value="saved"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600"
              >
                Saved Items
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
                      {favorites.map((favorite) => (
                        <div
                          key={favorite.id}
                          className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition-colors"
                        >
                          <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3"></div>
                          <h3 className="font-semibold text-gray-900 capitalize">{favorite.type}</h3>
                          <p className="text-sm text-gray-600">{favorite.item.title || favorite.item.name}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => removeFromFavorites(favorite.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
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
                    <Dialog>
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
                    <Button
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent mt-4"
                    >
                      Change Password
                    </Button>
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