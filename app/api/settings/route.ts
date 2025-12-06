import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        credits: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Check if Twitter account is connected
    const twitterAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "twitter",
      },
    })

    return NextResponse.json({
      user,
      connectedAccounts: {
        twitter: !!twitterAccount,
      },
    })
  } catch (error) {
    console.error("Settings GET error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, currentPassword, newPassword } = body

    // Update name
    if (name !== undefined) {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
        select: {
          id: true,
          name: true,
          email: true,
          credits: true,
        },
      })

      return NextResponse.json({
        message: "Profile updated successfully",
        user: updatedUser,
      })
    }

    // Change password
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })

      if (!user || !user.password) {
        return NextResponse.json(
          { message: "User not found or password not set" },
          { status: 400 }
        )
      }

      const passwordValid = await bcrypt.compare(currentPassword, user.password)
      if (!passwordValid) {
        return NextResponse.json(
          { message: "Current password is incorrect" },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12)

      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      })

      return NextResponse.json({
        message: "Password changed successfully",
      })
    }

    return NextResponse.json(
      { message: "No valid update provided" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Settings POST error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}