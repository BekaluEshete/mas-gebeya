"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Heart, MessageCircle, Package, User, Settings } from "lucide-react"
import { useApp } from "@/context/app-context"

export function UserDashboard() {
  const { user, cart, favorites, setIsAuthModalOpen } = useApp()
  const [activeTab, setActiveTab] = useState("orders")
  const router = useRouter()

  useEffect(() => {
    console.log("[UserDashboard] User state:", user);
    if (user && user.role) {
      const targetPath = user.role === "admin" ? "/dashboard/admin" : "/dashboard/user";
      if (router.pathname !== targetPath) {
        console.log("[UserDashboard] Redirecting to:", targetPath);
        router.replace(targetPath);
      }
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
            <User className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h1>
            <p className="text-gray-600 mb-6">
              Please sign in to access your personalized dashboard and manage your account.
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Sign In to Continue
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
                <p className="text-gray-600 mt-1">Manage your orders, saved items, and account settings</p>
                <Badge variant="outline" className="mt-2 capitalize border-blue-200 text-blue-700">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in-up">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{cart?.length || 0}</div>
              <div className="text-gray-600 text-sm">Items in Cart</div>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-green-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-gray-600 text-sm">Active Orders</div>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-red-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{favorites?.length || 0}</div>
              <div className="text-gray-600 text-sm">Saved Items</div>
            </CardContent>
          </Card>

          <Card
            className="bg-white border-purple-100 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">5</div>
              <div className="text-gray-600 text-sm">Messages</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 animate-fade-in">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
            <TabsList className="grid w-full grid-cols-4 bg-blue-50 rounded-xl p-1">
              <TabsTrigger
                value="orders"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600"
              >
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600"
              >
                Saved Items
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600"
              >
                Messages
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-6 mt-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span>Recent Orders</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((order) => (
                      <div
                        key={order}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg"></div>
                          <div>
                            <p className="font-semibold text-gray-900">Order #{order}001</p>
                            <p className="text-sm text-gray-600">2023 Toyota Camry</p>
                            <p className="text-xs text-gray-500">Ordered on Dec {order + 10}, 2023</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">$28,500</p>
                          <Badge className="bg-green-100 text-green-700 border-green-200">Confirmed</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                          <p className="text-sm text-gray-600">{favorite.item.id}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No saved items yet</p>
                      <p className="text-sm text-gray-500">Items you save will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages" className="space-y-6 mt-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    <span>Messages</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No messages yet</p>
                    <p className="text-sm text-gray-500">Your conversations with dealers and agents will appear here</p>
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
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.fullName || user.name}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{user.email}</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Account Type</label>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <Badge variant="outline" className="capitalize border-blue-200 text-blue-700">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Member Since</label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">December 2023</p>
                      </div>
                    </div>
                    <div className="flex space-x-4 pt-4">
                      <Link href="/profile/user">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Edit Profile</Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                      >
                        Change Password
                      </Button>
                    </div>
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