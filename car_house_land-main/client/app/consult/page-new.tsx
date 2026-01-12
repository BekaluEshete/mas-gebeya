"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, UserCheck, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ConsultPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Consultation Services</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with verified experts or become a consultant to share your knowledge
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Request Consultation */}
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl mb-2">Request Consultation</CardTitle>
              <CardDescription className="text-base">
                Get expert advice from our verified consultants across various fields
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li>• Access to verified professionals</li>
                <li>• Multiple consultation modes</li>
                <li>• Flexible scheduling</li>
                <li>• Expert guidance</li>
              </ul>
              <Button
                onClick={() => router.push('/consult/request')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Become Consultant */}
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl mb-2">Become a Consultant</CardTitle>
              <CardDescription className="text-base">
                Share your expertise and help others by becoming a verified consultant
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-gray-600 mb-6 space-y-2">
                <li>• Showcase your expertise</li>
                <li>• Document verification</li>
                <li>• Flexible working hours</li>
                <li>• Earn from your knowledge</li>
              </ul>
              <Button
                onClick={() => router.push('/consultant-register')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Apply Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Why Choose Our Platform?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="font-medium text-gray-900 mb-2">Verified Experts</div>
                  <p className="text-gray-600">All consultants are thoroughly vetted and verified</p>
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-2">Secure & Private</div>
                  <p className="text-gray-600">Your consultations are confidential and secure</p>
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-2">Quality Assurance</div>
                  <p className="text-gray-600">Regular quality checks and feedback collection</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}