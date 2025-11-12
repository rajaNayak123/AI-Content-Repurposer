import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { extractYoutubeTranscript } from "@/lib/youtube-utils"
import { scrapeBlogContent } from "@/lib/scrape-utils"
import { generateContent } from "@/lib/ai-utils"

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check credits
    if (user.credits <= 0) {
      return NextResponse.json({ message: "You are out of credits" }, { status: 403 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 })
    }

    // Extract content based on URL type
    let sourceText = ""
    const isYoutube = url.includes("youtube.com") || url.includes("youtu.be")

    if (isYoutube) {
      sourceText = await extractYoutubeTranscript(url)
    } else {
      sourceText = await scrapeBlogContent(url)
    }

    if (!sourceText) {
      return NextResponse.json({ message: "Could not extract content from the provided URL" }, { status: 400 })
    }

    // Generate content using AI
    const aiResult = await generateContent(sourceText)

    // Save to database
    const generation = await prisma.generation.create({
      data: {
        sourceUrl: url,
        resultTweets: aiResult.tweets,
        resultLinkedin: aiResult.linkedin,
        resultEmail: aiResult.email,
        userId: user.id,
      },
    })

    // Decrement credits
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { credits: user.credits - 1 },
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
  } catch (error) {
    console.error("Generation error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
