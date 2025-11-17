import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession()

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

    const safeGenerations = generations.map((gen) => ({
      ...gen,
      resultImagePrompts: gen.resultImagePrompts ?? [], 
    }))

    return NextResponse.json({ generations, credits: user.credits }, { status: 200 })
  } catch (error) {
    console.error("Get generations error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
