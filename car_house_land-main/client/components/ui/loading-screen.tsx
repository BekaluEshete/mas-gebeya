"use client"

import { Loader2 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingScreen({ message = "Loading...", fullScreen = true }: LoadingScreenProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white z-50 flex items-center justify-center"
    : "flex items-center justify-center p-8"

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <Loader2 className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Please wait</h3>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}
