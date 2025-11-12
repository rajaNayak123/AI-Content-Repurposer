import { getToken } from "next-auth/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Protected routes
  const protectedPaths = ["/dashboard", "/history"]
  const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/history/:path*"],
}
