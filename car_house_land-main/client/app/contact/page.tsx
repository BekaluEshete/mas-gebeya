"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ContactPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/deals")
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-red-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-responsive-2xl font-bold text-gray-900 mb-4">Redirecting to Deals...</h1>
        <p className="text-gray-600">Taking you to your deals page</p>
      </div>
    </div>
  )
}
