import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = {
  "/dashboard/admin": ["admin"],
  "/profile/admin": ["admin"],
  "/dashboard/user": ["user", "admin", "owner"],
  "/profile/user": ["user", "admin", "owner"],
  "/deals": ["user", "admin", "owner"],
  "/cart": ["user", "admin", "owner"],
}

const authRequiredRoutes = ["/dashboard", "/profile", "/deals", "/cart"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token =
    request.cookies.get("accessToken")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

  const userCookie = request.cookies.get("user")?.value
  let user = null

  if (userCookie) {
    try {
      const decodedUser = decodeURIComponent(userCookie)
      user = JSON.parse(decodedUser)
    } catch (error) {
      console.error("[middleware] Failed to parse user cookie:", error)
    }
  }

  const requiresAuth = authRequiredRoutes.some((route) => pathname.startsWith(route))
  const isProtectedRoute = Object.keys(protectedRoutes).some((route) => pathname.startsWith(route))

  if ((requiresAuth || isProtectedRoute) && !token) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    url.searchParams.set("auth", "required")
    return NextResponse.redirect(url)
  }

  if (isProtectedRoute && token && !user) {
    const response = NextResponse.next()
    response.headers.set("x-auth-sync", "pending")
    return response
  }

  if (isProtectedRoute && user) {
    const matchedRoute = Object.keys(protectedRoutes).find((route) => pathname.startsWith(route))
    if (matchedRoute) {
      const requiredRoles = protectedRoutes[matchedRoute as keyof typeof protectedRoutes]
      if (!requiredRoles.includes(user.role)) {
        const url = request.nextUrl.clone()
        url.pathname = user.role === "admin" ? "/dashboard/admin" : "/dashboard/user"
        return NextResponse.redirect(url)
      }
    }
  }

  const response = NextResponse.next()
  if (user) {
    response.headers.set("x-user-id", user._id)
    response.headers.set("x-user-role", user.role)
    response.headers.set("x-user-authenticated", "true")
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}