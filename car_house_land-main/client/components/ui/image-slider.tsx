"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "./button"
import { Dialog, DialogContent } from "./dialog"

interface ImageSliderProps {
  images: string[]
  alt?: string
  className?: string
}

export function ImageSlider({ images, alt = "Image", className = "" }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  if (!images || images.length === 0) {
    return null
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const openSlider = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  return (
    <>
      {/* Main Image with Click Handler */}
      <div className={`relative group ${className}`}>
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover rounded-lg cursor-pointer"
          onClick={() => openSlider(currentIndex)}
        />
        {images.length > 1 && (
          <>
            {/* Navigation Buttons on Main Image */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            {/* Image Counter */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
        {/* Click to View All Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view all
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mt-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === index ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img
                src={image || "/placeholder.svg"}
                alt={`${alt} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full Screen Slider Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-0">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Main Image */}
            <img
              src={images[currentIndex] || "/placeholder.svg"}
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-12 w-12"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-12 w-12"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>

                {/* Continue/Next Button */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  <Button
                    onClick={goToNext}
                    className="bg-white/90 hover:bg-white text-black px-6 py-2"
                  >
                    Continue &gt;
                  </Button>
                </div>

                {/* Image Counter */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

