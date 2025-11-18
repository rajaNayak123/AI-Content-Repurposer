import { getToken } from "next-auth/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = req.nextUrl

  // Define protected and auth paths
  const protectedPaths = ["/dashboard", "/history", "/settings"]
  const authPaths = ["/auth/login", "/auth/signup"]

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  // If user is logged in and tries to access auth pages, redirect to dashboard
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // If user is not logged in and tries to access protected pages, redirect to login
  if (!token && isProtectedPath) {
    const loginUrl = new URL("/auth/login", req.url)
    loginUrl.searchParams.set("callbackUrl", req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/auth/login",
    "/auth/signup",
  ],
}
