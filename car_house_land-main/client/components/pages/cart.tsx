"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trash2, ShoppingBag, ArrowLeft, Heart } from "lucide-react"
import { useApp } from "@/context/app-context"
import { useState } from "react"

export function Cart() {
  const { cart = [], dispatch, removeFromCart, user, createDeal, cars, houses, lands, machines } = useApp()
  const [isCreatingDeals, setIsCreatingDeals] = useState(false)

  const subtotal = cart.reduce((total, item) => total + (item.item?.price || 0), 0) // Removed quantity multiplication since each item quantity is always 1
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const formatPrice = (price: number, type: string, item: any) => {
    if (type === "house" && item?.listingType === "rent") {
      return `$${price.toLocaleString()}/month`
    }
    return `$${price.toLocaleString()}`
  }

  const handleGoToDeals = async () => {
    if (!user) {
      return
    }

    setIsCreatingDeals(true)
    console.log("[v0] Starting to create deals for", cart.length, "cart items")

    try {
      for (let i = 0; i < cart.length; i++) {
        const cartItem = cart[i]
        console.log("[v0] Processing cart item:", cartItem.id, "type:", cartItem.type)

        // Get complete product details from the appropriate data source
        let completeProduct = cartItem.item

        // Ensure we have complete product data by fetching from the main data arrays if needed
        if (cartItem.type === "car") {
          const foundCar = cars?.find((car) => car.id === cartItem.item.id)
          if (foundCar) {
            completeProduct = foundCar
            console.log("[v0] Found complete car details:", foundCar.title)
          }
        } else if (cartItem.type === "house") {
          const foundHouse = houses?.find((house) => house.id === cartItem.item.id)
          if (foundHouse) {
            completeProduct = foundHouse
            console.log("[v0] Found complete house details:", foundHouse.title)
          }
        } else if (cartItem.type === "land") {
          const foundLand = lands?.find((land) => land.id === cartItem.item.id)
          if (foundLand) {
            completeProduct = foundLand
            console.log("[v0] Found complete land details:", foundLand.title)
          }
        } else if (cartItem.type === "machine") {
          const foundMachine = machines?.find((machine) => machine.id === cartItem.item.id)
          if (foundMachine) {
            completeProduct = foundMachine
            console.log("[v0] Found complete machine details:", foundMachine.title)
          }
        }

        console.log("[v0] Creating deal for item:", completeProduct.id, "type:", cartItem.type)
        const message = `ሰላም፣ በ${completeProduct.title} ላይ ፍላጎት አለኝ። እባክዎ ተጨማሪ መረጃ ይስጡኝ?`

        await createDeal(cartItem.type, completeProduct, message)
        console.log("[v0] Successfully created deal for:", completeProduct.title)
      }

      console.log("[v0] Finished creating deals, clearing cart")
      // Clear the cart after creating deals
      dispatch({ type: "SET_CART", payload: [] })

      // Redirect to deals page
      window.location.href = "/deals"
    } catch (error) {
      console.error("[v0] Error creating deals from cart:", error)
      // Still redirect even if there's an error
      window.location.href = "/deals"
    } finally {
      setIsCreatingDeals(false)
    }
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-16 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent>
              <div className="space-y-6 animate-fade-in">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto transform hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="w-12 h-12 text-blue-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-gray-900">Your cart is empty</h2>
                  <p className="text-gray-600 text-lg">Start browsing to add items to your cart</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/cars">
                    <Button className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-200">
                      Browse Cars
                    </Button>
                  </Link>
                  <Link href="/houses">
                    <Button
                      variant="outline"
                      className="hover:bg-green-50 border-green-200 text-green-700 transform hover:scale-105 transition-all duration-200 bg-transparent"
                    >
                      Browse Houses
                    </Button>
                  </Link>
                  <Link href="/lands">
                    <Button
                      variant="outline"
                      className="hover:bg-yellow-50 border-yellow-200 text-yellow-700 transform hover:scale-105 transition-all duration-200 bg-transparent"
                    >
                      Browse Lands
                    </Button>
                  </Link>
                  <Link href="/machines">
                    <Button
                      variant="outline"
                      className="hover:bg-orange-50 border-orange-200 text-orange-700 transform hover:scale-105 transition-all duration-200 bg-transparent"
                    >
                      Browse Machines
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600 text-lg">{cart.length} items in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((cartItem, index) => (
              <Card
                key={cartItem.id}
                className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <div className="w-32 h-24 relative overflow-hidden rounded-lg group">
                        <Image
                          src={cartItem.item?.images?.[0] || "/placeholder.svg?height=96&width=128"}
                          alt={cartItem.item?.title || "Item"}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors duration-200">
                            {cartItem.item?.title || "Unknown Item"}
                          </h3>
                          <p className="text-gray-600">{cartItem.item?.location || "Location not specified"}</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`capitalize ${
                                cartItem.type === "car"
                                  ? "border-blue-200 text-blue-700 bg-blue-50"
                                  : cartItem.type === "house"
                                    ? "border-green-200 text-green-700 bg-green-50"
                                    : cartItem.type === "land"
                                      ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                                      : "border-orange-200 text-orange-700 bg-orange-50"
                              }`}
                            >
                              {cartItem.type}
                            </Badge>
                            {cartItem.item?.status && (
                              <Badge variant={cartItem.item.status === "available" ? "default" : "secondary"}>
                                {cartItem.item.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 transition-colors duration-200"
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(cartItem.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(cartItem.item?.price || 0, cartItem.type, cartItem.item)}
                        </div>

                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                          <span className="text-sm font-medium text-gray-600">Quantity: 1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <CardTitle className="text-xl font-bold text-gray-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-semibold">${tax.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 transform hover:scale-105 transition-all duration-200"
                  size="lg"
                  onClick={handleGoToDeals}
                  disabled={isCreatingDeals || !user}
                >
                  {isCreatingDeals ? "Creating Deals..." : "Go to Deals"}
                </Button>

                


                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 pt-4">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs font-medium text-gray-600">Free</div>
                    <div className="text-xs text-gray-500">Shipping</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs font-medium text-gray-600">30-Day</div>
                    <div className="text-xs text-gray-500">Returns</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs font-medium text-gray-600">24/7</div>
                    <div className="text-xs text-gray-500">Support</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
