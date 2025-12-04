import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { extractYoutubeTranscript } from "@/lib/youtube-utils"
import { scrapeBlogContent } from "@/lib/scrape-utils"
import { generateContent } from "@/lib/ai-utils"

export async function POST(request: NextRequest) {
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

    if (user.credits <= 0) {
      return NextResponse.json({ 
        message: "You are out of credits. Please purchase more to continue." 
      }, { status: 403 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 })
    }

    if (!isValidUrl(url)) {
      return NextResponse.json({ 
        message: "Invalid URL format. Please provide a valid URL." 
      }, { status: 400 })
    }

    let sourceText = ""
    const isYoutube = url.includes("youtube.com") || url.includes("youtu.be")

    if (isYoutube) {
      try {
        sourceText = await extractYoutubeTranscript(url)
        if (sourceText.length < 50) {
          throw new Error("Transcript is too short.")
        }
      } catch (error: any) {
        console.error("YouTube transcript error:", error)
        return NextResponse.json({ 
          message: "Failed to extract YouTube transcript. " + (error.message || ""),
          hint: "Try a different video or use a blog URL."
        }, { status: 400 })
      }
    } else {
      try {
        sourceText = await scrapeBlogContent(url)
        if (!sourceText || sourceText.length < 100) {
          throw new Error("Insufficient content extracted")
        }
      } catch (error) {
        console.error("Blog scraping error:", error)
        return NextResponse.json({ 
          message: "Failed to extract content from the URL.",
          hint: "Make sure the URL is a public blog post."
        }, { status: 400 })
      }
    }

    if (sourceText.length < 100) {
      return NextResponse.json({ 
        message: "Content too short to generate meaningful posts.",
      }, { status: 400 })
    }

    // Use Prisma transaction to atomically decrement credits
    // and ensure user has sufficient balance
    let updatedUser
    try {
      updatedUser = await prisma.user.update({
        where: { 
          id: user.id,
          credits: { gte: 1 } // Only update if credits >= 1
        },
        data: { 
          credits: { decrement: 1 } 
        },
      })
    } catch (error) {
      // If update fails, user doesn't have enough credits (race condition caught)
      return NextResponse.json({ 
        message: "Insufficient credits. Please purchase more to continue." 
      }, { status: 403 })
    }

    // Generate content AFTER deducting credits
    let aiResult
    try {
      aiResult = await generateContent(sourceText)
      
      if (!aiResult) {
        throw new Error("Failed to generate content")
      }
    } catch (error: any) {
      // If generation fails, refund the credit
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { increment: 1 } },
      })
      
      console.error("Content generation error:", error)
      return NextResponse.json({ 
        message: "Failed to generate content. Your credit has been refunded.",
        error: error.message 
      }, { status: 500 })
    }

    // Create Generation record
    const generation = await prisma.generation.create({
      data: {
        sourceUrl: url,
        resultTweets: aiResult.tweets || [],
        resultLinkedin: aiResult.linkedin || "",
        resultInstagram: aiResult.instagram || "", 
        resultFacebook: aiResult.facebook || "",   
        resultEmail: aiResult.email || "",
        userId: user.id,
      },
    })

    return NextResponse.json(
      {
        message: "Content generated successfully",
        result: aiResult,
        credits: updatedUser.credits,
        generationId: generation.id,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Generation error:", error)
    return NextResponse.json({ 
      message: "An unexpected error occurred.",
      error: error.message 
    }, { status: 500 })
  }
}

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === "http:" || urlObj.protocol === "https:"
  } catch {
    return false
  }
}