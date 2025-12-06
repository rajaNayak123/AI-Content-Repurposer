import { NextResponse } from "next/server"
import {auth} from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const generations = await prisma.generation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    // Return generations directly
    return NextResponse.json({ generations, credits: user.credits }, { status: 200 })
  } catch (error) {
    console.error("Get generations error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
