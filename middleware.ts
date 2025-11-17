import { getToken } from "next-auth/jwt"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const protectedPaths = ["/dashboard", "/history", "/settings"]
  const { pathname } = req.nextUrl

  if (protectedPaths.some((path) => pathname.startsWith(path)) && !token) {
    const loginUrl = new URL("/auth/login", req.url)
    loginUrl.searchParams.set("callbackUrl", req.url) 
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/history/:path*", "/settings/:path*", "/dashboard", "/history", "/settings"],
}
