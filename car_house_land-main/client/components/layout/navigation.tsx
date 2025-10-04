"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ShoppingCart, User, LogOut, HomeIcon, MessageSquare, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/context/app-context"
import { useAuth } from "@/hooks/use-auth"
import { LoadingScreen } from "@/components/ui/loading-screen"

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const { cart = [], setIsAuthModalOpen } = useApp()
  const { user, logout, loading } = useAuth()

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [user?._id])

  const regularNavItems = [
    { href: "/", label: "Home", icon: HomeIcon },
    { href: "/cars", label: "Cars" },
    { href: "/houses", label: "Properties" },
    { href: "/lands", label: "Lands" },
    { href: "/machines", label: "Machines" },
  ]

  const adminNavItems = [
    { href: "/dashboard/admin", label: "Dashboard", icon: Shield },
    { href: "/profile/admin", label: "Profile", icon: User },
  ]

  const navItems = user?.role === "admin" ? adminNavItems : regularNavItems

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const cartItemCount = Array.isArray(cart) ? cart.length : 0

  const handleLogout = async () => {
    console.log("[v0] Navigation logout triggered")
    setIsLoggingOut(true)
    try {
      await logout()
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("[v0] Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoggingOut) {
    return <LoadingScreen message="Signing you out..." fullScreen={true} />
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-border/50 fixed top-0 left-0 right-0 z-50 shadow-sm animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link
            href={user?.role === "admin" ? "/dashboard/admin" : "/"}
            className="text-lg sm:text-xl md:text-2xl font-serif font-bold gradient-text-brand hover:scale-105 transition-all duration-300 flex-shrink-0"
          >
            <span className="hidden sm:inline">MAS Gebeya PLC</span>
            <span className="sm:hidden">MAS Gebeya</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-4 lg:ml-10 flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2 lg:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center hover:scale-105 relative group ${
                    isActive(item.href) ? "text-blue-600" : "text-foreground/80 hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-1 lg:mr-2" />}
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden text-xs">{item.label.slice(0, 4)}</span>
                  <div
                    className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ${
                      isActive(item.href) ? "w-6 lg:w-8" : "w-0 group-hover:w-4 lg:group-hover:w-6"
                    }`}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {user?.role !== "admin" && (
              <>
                <Link href="/deals">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative hover:bg-orange-500/10 text-foreground/80 hover:text-orange-500 transition-all duration-300 hover:scale-105 font-medium px-2 lg:px-3"
                  >
                    <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="ml-1 lg:ml-2 hidden lg:inline text-sm">Deals</span>
                  </Button>
                </Link>

                <Link href="/cart">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative hover:bg-blue-500/10 text-foreground/80 hover:text-blue-500 transition-all duration-300 hover:scale-105 font-medium px-2 lg:px-3"
                  >
                    <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse bg-red-500 text-white border-0">
                        {cartItemCount}
                      </Badge>
                    )}
                    <span className="ml-1 lg:ml-2 hidden lg:inline text-sm">Cart</span>
                  </Button>
                </Link>
              </>
            )}

            {loading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-1 lg:space-x-2">
                <Link href={user.role === "admin" ? "/profile/admin" : "/dashboard/user"}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1 lg:space-x-2 hover:scale-105 transition-all duration-300 hover:bg-blue-500/10 hover:text-blue-500 font-medium px-2 lg:px-3"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline text-sm max-w-20 truncate">{user.fullName}</span>
                    {user.role === "admin" && <Shield className="w-3 h-3" />}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="hover:scale-105 transition-all duration-300 hover:text-red-500 hover:bg-red-500/10 font-medium px-2 lg:px-3 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                className="hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm px-3 lg:px-4"
              >
                <span className="hidden lg:inline">Sign In</span>
                <span className="lg:hidden">Login</span>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:scale-105 transition-all duration-300 hover:bg-blue-500/10 hover:text-blue-500 p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-3 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col space-y-1">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center animate-in slide-in-from-left relative ${
                    isActive(item.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                  {item.label}
                  {isActive(item.href) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
                  )}
                </Link>
              ))}

              <div className="border-t border-border/50 pt-2 mt-2 space-y-1 animate-in fade-in duration-500">
                {user?.role !== "admin" && (
                  <>
                    <Link href="/deals" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start hover:scale-105 transition-all duration-300 hover:bg-orange-500/10 hover:text-orange-500 font-medium py-2.5"
                      >
                        <MessageSquare className="w-4 h-4 mr-3" />
                        <span className="text-sm">Deals</span>
                      </Button>
                    </Link>
                    <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start relative hover:scale-105 transition-all duration-300 hover:bg-blue-500/10 hover:text-blue-500 font-medium py-2.5"
                      >
                        <ShoppingCart className="w-4 h-4 mr-3" />
                        <span className="text-sm">Cart</span>
                        {cartItemCount > 0 && (
                          <Badge className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse bg-red-500 text-white border-0">
                            {cartItemCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  </>
                )}

                {loading ? (
                  <div className="w-full h-10 bg-gray-200 animate-pulse rounded"></div>
                ) : user ? (
                  <>
                    <Link
                      href={user.role === "admin" ? "/profile/admin" : "/dashboard/user"}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start hover:scale-105 transition-all duration-300 hover:bg-blue-500/10 hover:text-blue-500 font-medium py-2.5"
                      >
                        <User className="w-4 h-4 mr-3" />
                        <span className="text-sm truncate">{user.fullName}</span>
                        {user.role === "admin" && <Shield className="w-3 h-3 ml-2" />}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start hover:scale-105 transition-all duration-300 hover:text-red-500 hover:bg-red-500/10 font-medium py-2.5"
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      <span className="text-sm">Logout</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm py-2.5 mt-2"
                    onClick={() => {
                      setIsAuthModalOpen(true)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
