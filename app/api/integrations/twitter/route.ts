import { NextRequest, NextResponse } from "next/server"
import {auth} from "@/auth"
import { prisma } from "@/lib/prisma"
import { TwitterApi } from "twitter-api-v2"

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
    const { text } = body

    if (!text) {
      return NextResponse.json(
        { message: "Tweet text is required" },
        { status: 400 }
      )
    }

    // Find Twitter account linked to this user
    const twitterAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "twitter",
      },
    })

    if (!twitterAccount) {
      return NextResponse.json(
        { message: "Twitter account not connected. Please connect your Twitter account in Settings." },
        { status: 400 }
      )
    }

    let accessToken = twitterAccount.access_token
    let refreshToken = twitterAccount.refresh_token

    // Check if access token is expired
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = twitterAccount.expires_at || 0

    if (expiresAt && now >= expiresAt) {
      // Token expired, refresh it
      if (!refreshToken) {
        return NextResponse.json(
          { message: "Twitter connection expired. Please reconnect your account in Settings." },
          { status: 400 }
        )
      }

      try {
        const client = new TwitterApi({
          clientId: process.env.TWITTER_CLIENT_ID!,
          clientSecret: process.env.TWITTER_CLIENT_SECRET!,
        })

        const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } = 
          await client.refreshOAuth2Token(refreshToken)

        // Update tokens in database
        await prisma.account.update({
          where: {
            id: twitterAccount.id,
          },
          data: {
            access_token: newAccessToken,
            refresh_token: newRefreshToken || refreshToken,
            expires_at: Math.floor(Date.now() / 1000) + expiresIn,
          },
        })

        accessToken = newAccessToken
        refreshToken = newRefreshToken || refreshToken
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError)
        return NextResponse.json(
          { message: "Failed to refresh Twitter connection. Please reconnect your account in Settings." },
          { status: 400 }
        )
      }
    }

    // Post tweet
    try {
      const client = new TwitterApi(accessToken!)
      const result = await client.v2.tweet(text)

      return NextResponse.json({
        success: true,
        message: "Tweet posted successfully!",
        tweetId: result.data.id,
      })
    } catch (tweetError: any) {
      console.error("Tweet post error:", tweetError)
      return NextResponse.json(
        { message: `Failed to post tweet: ${tweetError.message || "Unknown error"}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Twitter post error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}