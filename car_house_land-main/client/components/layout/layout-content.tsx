"use client"

import type React from "react"

import { useApp } from "@/context/app-context"
import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { AuthModal } from "@/components/ui/auth-modal"

interface LayoutContentProps {
  children: React.ReactNode
}

export function LayoutContent({ children }: LayoutContentProps) {
  const { user } = useApp()

  return (
    <div key={user?.id || "no-user"} className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16 min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer />
      <AuthModal />
    </div>
  )
}
