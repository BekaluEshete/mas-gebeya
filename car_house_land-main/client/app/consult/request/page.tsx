"use client"

import React, { useState, useEffect } from "react"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Headphones, Calendar, Video, Phone, Map, Star, Users, ArrowLeft } from "lucide-react"
import type { Consultation, Consultant } from "@/types"
import { authService } from "@/lib/auth" // For token utils
import { useRouter } from "next/navigation"

export default function ConsultRequestPage() {
  const router = useRouter()
  const { user, createConsultation } = useApp()
  const [step, setStep] = useState(1) // 1: Request Form, 2: Consultant Selection, 3: Booking, 4: Confirmation
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [loadingConsultants, setLoadingConsultants] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    category: "" as Consultation["category"],
    description: "",
  })
  const [bookingData, setBookingData] = useState({
    type: "" as Consultation["type"],
    mode: "" as Consultation["mode"],
    dateTime: new Date(Date.now() + 86400000), // Default to tomorrow
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<string | null>(null)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [tempDateTime, setTempDateTime] = useState<Date | null>(null)
  const [consultantFetchError, setConsultantFetchError] = useState<string | null>(null)

  // Fetch available consultants
  useEffect(() => {
    const fetchConsultants = async () => {
      setLoadingConsultants(true)
      setConsultantFetchError(null)
      try {
        const response = await fetch('/api/consultants')
        const result = await response.json()
        if (result.status === 'success') {
          setConsultants(Array.isArray(result.data) ? result.data : [])
          setSelectedConsultant(null)
        } else {
          setConsultants([])
          setConsultantFetchError(result?.message || "Failed to fetch consultants")
        }
      } catch (error) {
        console.error('Error fetching consultants:', error)
        setConsultants([])
        setConsultantFetchError("Network error while fetching consultants")
      } finally {
        setLoadingConsultants(false)
      }
    }

    if (step === 2) {
      fetchConsultants()
    }
  }, [step])

  // Reset selection when category changes
  useEffect(() => {
    setSelectedConsultant(null)
  }, [formData.category])

  // Generate available slots for the next 30 days
  const generateAvailableSlots = () => {
    const slots = []
    const today = new Date()
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      slots.push(date)
    }
    return slots
  }

  const availableSlots = generateAvailableSlots()

  const handleSubmitRequest = () => {
    console.log('=== REQUEST FORM SUBMIT ==='); // Debug
    console.log('Current user from context:', user); // NEW: Log user object

    // Description is now optional
    if (!formData.fullName || !formData.email || !formData.phone || !formData.category) {
      console.log('Missing form fields'); // Debug
      alert("Please fill all required fields.")
      return
    }

    // Auto-set type from category
    setBookingData(prev => ({ ...prev, type: formData.category }))
    setStep(2) // Move to consultant selection
  }

  const handleSelectConsultant = () => {
    if (!selectedConsultant) {
      alert("Please select a consultant.")
      return
    }
    setStep(3) // Move to booking
  }

  const handleBookConsultation = async () => {
    console.log('=== BOOKING SUBMIT ==='); // Debug
    console.log('User object:', user); // NEW: Full user log
    console.log('Form data:', formData); // NEW
    console.log('Booking data:', bookingData); // NEW

    // Type is now auto-set, check mode and dateTime
    if (!bookingData.mode || !bookingData.dateTime) {
      console.log('Missing booking fields'); // Debug
      alert("Please select all booking options.")
      return
    }

    if (bookingData.dateTime <= new Date()) {
      alert("Date must be in the future.")
      return
    }

    // FIXED: Direct token retrieval (bypasses context if needed)
    const token = authService.getStoredToken() || localStorage.getItem('accessToken');
    console.log('Retrieved token:', token ? `Present (starts with: ${token.substring(0, 10)}...)` : 'MISSING'); // NEW: Log token status

    if (!token) {
      console.log('No token found - cannot proceed'); // Debug
      alert("Session expired. Please log in again.");
      // TODO: Trigger login modal or redirect to /login
      return;
    }

    setIsSubmitting(true)
    try {
      const consultationData = {
        ...formData,
        type: formData.category, // Use category as type directly
        mode: bookingData.mode,
        dateTime: bookingData.dateTime.toISOString(),
        consultantId: selectedConsultant?._id,
      }
      console.log('Payload to send:', consultationData); // NEW: Exact payload

      // FIXED: Pass token explicitly to context (if your createConsultation accepts it as param)
      // If not, update context to use this token internally (see Step 2)
      const newConsult = await createConsultation(consultationData, token); // UPDATED: Pass token
      console.log('Consultation created:', newConsult); // NEW

      setConfirmation(`Booking confirmed! ID: ${newConsult.id || newConsult._id}. You'll receive an email/SMS shortly.`)
      setStep(4)
    } catch (error: any) {
      console.error('Booking error:', error); // NEW: Full error
      alert(`Booking failed: ${error.message || 'Check console for details'}`);
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Headphones className="w-6 h-6 mr-2" />
                Booking Confirmed!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-lg font-medium">{confirmation}</p>
              <Button onClick={() => router.push("/")} className="mt-4">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/consult')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Consult Options
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Request Consultation</h1>
            <p className="text-gray-600 mt-2">Get expert advice from verified consultants</p>
          </div>
          <div></div> {/* Spacer for centering */}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Headphones className="w-6 h-6 mr-2" />
              Request Service
            </CardTitle>
            <CardDescription>
              Get expert advice on {
                step === 1 ? "your needs" :
                step === 2 ? "consultant selection" :
                "your booking"
              }.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+251 911 000 000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as any })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Research">Research</SelectItem>
                        <SelectItem value="Cases in law">Cases in law</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Short Description <span className="text-gray-400 font-normal">(Optional)</span></Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your issue or needs (optional)..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleSubmitRequest} className="w-full">
                  Select Consultant
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Select a Consultant</h3>
                  <p className="text-gray-600">Choose from our verified consultants specializing in {formData.category}</p>
                </div>

                {loadingConsultants ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading consultants...</p>
                  </div>
                ) : consultantFetchError ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">{consultantFetchError}</p>
                    <p className="text-sm text-gray-500 mt-2">Please try again later.</p>
                  </div>
                ) : consultants.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No consultants available for this category yet.</p>
                    <p className="text-sm text-gray-500 mt-2">You can still proceed and we'll assign a consultant when available.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {(() => {
                      const category = (formData.category || "").toLowerCase()
                      const matches = consultants.filter((c) =>
                        (c.specialization || []).some((s) => (s || "").toLowerCase() === category),
                      )
                      const list = matches.length > 0 ? matches : consultants
                      return list.map((consultant) => (
                        <Card
                          key={consultant._id}
                          className={`cursor-pointer transition-all ${
                            selectedConsultant?._id === consultant._id
                              ? 'ring-2 ring-blue-500 bg-blue-50'
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => setSelectedConsultant(consultant)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={consultant.userId?.avatar || ""} />
                                <AvatarFallback>
                                  {(consultant.userId?.fullName || "U")
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{consultant.userId?.fullName || "Unknown"}</h4>
                                  <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm text-gray-600 ml-1">
                                      {consultant.rating.toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {(consultant.bio || "").substring(0, 100)}...
                                </p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {consultant.specialization.slice(0, 3).map((spec) => (
                                    <Badge key={spec} variant="secondary" className="text-xs">
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-green-600 font-medium">
                                    {consultant.hourlyRate} ETB/hour
                                  </span>
                                  <span className="text-gray-500">
                                    {consultant.totalConsultations} consultations
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    })()}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSelectConsultant} className="flex-1">
                    Continue to Booking
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {/* Removed Consultation Type Selector - now using Category */}
                <div>
                  <Label htmlFor="mode">Mode *</Label>
                  <Select value={bookingData.mode} onValueChange={(v) => setBookingData({ ...bookingData, mode: v as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Online video call"><Video className="w-4 h-4 mr-2" />Online Video Call</SelectItem>
                      <SelectItem value="Phone call"><Phone className="w-4 h-4 mr-2" />Phone Call</SelectItem>
                      <SelectItem value="In-person"><Map className="w-4 h-4 mr-2" />In-Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Available Date & Time *</Label>
                  <Dialog
                    open={isDatePickerOpen}
                    onOpenChange={(open) => {
                      setIsDatePickerOpen(open)
                      if (open) {
                        // Initialize temp date when dialog opens
                        setTempDateTime(bookingData.dateTime)
                      } else {
                        // Reset temp date when dialog closes
                        setTempDateTime(null)
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start" type="button">
                        <Calendar className="w-4 h-4 mr-2" />
                        {bookingData.dateTime.toLocaleDateString()} at {bookingData.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Select Date & Time</DialogTitle>
                      </DialogHeader>
                      <div className="p-4">
                        <DatePicker
                          selected={tempDateTime || bookingData.dateTime}
                          onChange={(date) => {
                            if (date) {
                              setTempDateTime(date)
                            }
                          }}
                          showTimeSelect
                          timeIntervals={30}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          inline
                          minDate={new Date()} // Prevent past dates
                          maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
                          filterDate={(date) => {
                            // Allow all future dates within 30 days
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const maxDate = new Date(today)
                            maxDate.setDate(today.getDate() + 30)
                            return date >= today && date <= maxDate
                          }}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-end gap-3 p-4 pt-0 border-t">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setTempDateTime(null)
                            setIsDatePickerOpen(false)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            const dateToUse = tempDateTime || bookingData.dateTime
                            setBookingData({ ...bookingData, dateTime: dateToUse })
                            setTempDateTime(null)
                            setIsDatePickerOpen(false)
                          }}
                        >
                          OK
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleBookConsultation} disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}