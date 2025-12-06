import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate the user
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

    // 2. Await the params promise
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ message: "Generation ID is required" }, { status: 400 })
    }

    const generation = await prisma.generation.findUnique({
      where: { id },
    })

    if (!generation) {
      return NextResponse.json({ message: "Generation not found" }, { status: 404 })
    }

    if (generation.userId !== user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    await prisma.generation.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Generation deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete generation error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}