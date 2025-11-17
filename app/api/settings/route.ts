import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth"
import {prisma} from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(){
    try {
        const session = await getServerSession(authOptions)

        if(!session?.user.email){
           return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if(!user){
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        // Return user data, excluding password
        const { password, ...userData } = user
        return NextResponse.json({ user: userData }, { status: 200 })
    } catch (error) {
        console.error("Get user error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest){
    try {
        const session = await getServerSession(authOptions)

        if(!session?.user.email){
           return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where:{ email: session.user.email }
        })

        if(!user){
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }   

        const body = await request.json()
        const { name, currentPassword, newPassword } = body

        if(name){
            const updatedUser = await prisma.user.update({
                where: { email: session.user.email },
                data: { name }
            })
            const { password, ...userData } = updatedUser
            return NextResponse.json(
                { message: "Name updated successfully", user: userData },
                { status: 200 }
            )
        }

        if(currentPassword && newPassword){
            if(!user.password){
                return NextResponse.json(
                    { message: "Cannot change password for this account type." },
                    { status: 400 }
                )
            }

            const validatePassword = await bcrypt.compare(currentPassword, user.password)

            if(!validatePassword){
                return NextResponse.json(
                    { message: "Invalid current password" },
                    { status: 400 }
                )
            }
            
            // Hash new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10)

            // Update password
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedNewPassword },
            })

            return NextResponse.json(
                { message: "Password changed successfully" },
                { status: 200 }
            )
        }

        return NextResponse.json({ message: "Invalid request" }, { status: 400 })
    } catch (error) {
        console.error("Update account error:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}