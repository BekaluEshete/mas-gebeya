"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  Car,
  Home,
  MapPin,
  Wrench,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react"
import { useApp } from "@/context/app-context"
import type { Deal } from "@/types"

export function UserDeals() {
  const { user, getUserDeals, refreshDeals } = useApp()
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)

  const userDeals = getUserDeals()

  const filteredDeals = userDeals.filter((deal) => {
    const matchesSearch =
      deal.item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.dealId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || deal.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      await refreshDeals()
    } catch (error) {
      console.error("Error refreshing deals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: Deal["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: Deal["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  const getItemIcon = (itemType: Deal["itemType"]) => {
    switch (itemType.toLowerCase()) {
      case "car":
        return <Car className="w-5 h-5" />
      case "property":
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

  const handleViewDeal = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsDetailModalOpen(true)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-red-50 to-orange-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-responsive-2xl font-bold text-gray-900">Please Sign In</h1>
          <p className="text-responsive-base text-gray-600 mt-2">You need to be signed in to view your deals</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-red-50 to-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-responsive-3xl font-bold gradient-text-brand">My Deals</h1>
              <p className="text-responsive-base text-gray-600 mt-2">
                Track your inquiries and deal progress with our team
              </p>
            </div>
            <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search deals by item name or deal ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredDeals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <MessageCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-responsive-lg font-semibold text-gray-900">
                  {searchTerm || statusFilter !== "all" ? "No Matching Deals" : "No Deals Yet"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "You haven't made any inquiries yet. Browse our listings and contact us about items you're interested in."}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button asChild className="mt-4">
                    <a href="/">Browse Listings</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getItemIcon(deal.itemType)}
                      <CardTitle className="text-responsive-base truncate">{deal.item.title}</CardTitle>
                    </div>
                    <Badge className={`${getStatusColor(deal.status)} flex items-center space-x-1`}>
                      {getStatusIcon(deal.status)}
                      <span className="capitalize text-xs">{deal.status}</span>
                    </Badge>
                  </div>
                  {deal.dealId && <p className="text-xs text-gray-500 font-mono">ID: {deal.dealId}</p>}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <img
                      src={deal.item.images[0] || "/placeholder.svg"}
                      alt={deal.item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-responsive-sm text-gray-600">Price:</span>
                      <span className="font-semibold text-responsive-sm">
                        ETB {deal.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-responsive-sm text-gray-600">Inquiry Date:</span>
                      <span className="text-responsive-sm">{new Date(deal.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-responsive-sm text-gray-600 line-clamp-2">{deal.message}</p>
                  </div>

                  <Button onClick={() => handleViewDeal(deal)} className="w-full mt-4" variant="outline">
                    View Details
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Deal Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedDeal && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    {getItemIcon(selectedDeal.itemType)}
                    <span>{selectedDeal.item.title}</span>
                    <Badge className={`${getStatusColor(selectedDeal.status)} flex items-center space-x-1 ml-auto`}>
                      {getStatusIcon(selectedDeal.status)}
                      <span className="capitalize">{selectedDeal.status}</span>
                    </Badge>
                  </DialogTitle>
                  {selectedDeal.dealId && (
                    <p className="text-sm text-gray-500 font-mono">Deal ID: {selectedDeal.dealId}</p>
                  )}
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Item Details */}
                  <div className="space-y-4">
                    <h3 className="text-responsive-lg font-semibold">Item Details</h3>

                    <div className="aspect-video relative overflow-hidden rounded-lg">
                      <img
                        src={selectedDeal.item.images[0] || "/placeholder.svg"}
                        alt={selectedDeal.item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold">ETB {selectedDeal.originalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span>{selectedDeal.item.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="capitalize">{selectedDeal.itemType}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-responsive-sm text-gray-600">{selectedDeal.item.description}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Your Message</h4>
                      <p className="text-responsive-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {selectedDeal.message}
                      </p>
                    </div>

                    {selectedDeal.status === "cancelled" && selectedDeal.cancellationReason && (
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Cancellation Reason</h4>
                        <p className="text-responsive-sm text-red-600 bg-red-50 p-3 rounded-lg">
                          {selectedDeal.cancellationReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Admin Contact Info */}
                  <div className="space-y-4">
                    <h3 className="text-responsive-lg font-semibold">Contact Information</h3>

                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="text-center">
                          <h4 className="font-semibold text-responsive-base">{selectedDeal.adminInfo.name}</h4>
                          <p className="text-responsive-sm text-gray-600">Your dedicated support agent</p>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-brand-blue" />
                            <div>
                              <p className="font-medium text-responsive-sm">Email</p>
                              <a
                                href={`mailto:${selectedDeal.adminInfo.email}`}
                                className="text-brand-blue hover:underline text-responsive-sm"
                              >
                                {selectedDeal.adminInfo.email}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-brand-green" />
                            <div>
                              <p className="font-medium text-responsive-sm">Phone</p>
                              <a
                                href={`tel:${selectedDeal.adminInfo.phone}`}
                                className="text-brand-green hover:underline text-responsive-sm"
                              >
                                {selectedDeal.adminInfo.phone}
                              </a>
                            </div>
                          </div>

                          {selectedDeal.adminInfo.telegram && (
                            <div className="flex items-center space-x-3">
                              <MessageCircle className="w-5 h-5 text-brand-blue" />
                              <div>
                                <p className="font-medium text-responsive-sm">Telegram</p>
                                <a
                                  href={`https://t.me/${selectedDeal.adminInfo.telegram.replace("@", "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-blue hover:underline text-responsive-sm"
                                >
                                  {selectedDeal.adminInfo.telegram}
                                </a>
                              </div>
                            </div>
                          )}

                          {selectedDeal.adminInfo.whatsapp && (
                            <div className="flex items-center space-x-3">
                              <Phone className="w-5 h-5 text-brand-green" />
                              <div>
                                <p className="font-medium text-responsive-sm">WhatsApp</p>
                                <a
                                  href={`https://wa.me/${selectedDeal.adminInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-green hover:underline text-responsive-sm"
                                >
                                  {selectedDeal.adminInfo.whatsapp}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h5 className="font-medium text-responsive-sm">Deal Timeline</h5>
                          <div className="text-responsive-sm text-gray-600 space-y-1">
                            <p>Created: {new Date(selectedDeal.createdAt).toLocaleString()}</p>
                            <p>Last Updated: {new Date(selectedDeal.updatedAt).toLocaleString()}</p>
                            {selectedDeal.completedAt && (
                              <p>Completed: {new Date(selectedDeal.completedAt).toLocaleString()}</p>
                            )}
                            {selectedDeal.cancelledAt && (
                              <p>Cancelled: {new Date(selectedDeal.cancelledAt).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-3">
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <a href={`mailto:${selectedDeal.adminInfo.email}`}>
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </a>
                      </Button>
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <a href={`tel:${selectedDeal.adminInfo.phone}`}>
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
