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
      return NextResponse.json({ 
        message: "You are out of credits. Please purchase more to continue." 
      }, { status: 403 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return NextResponse.json({ 
        message: "Invalid URL format. Please provide a valid URL." 
      }, { status: 400 })
    }

    // Extract content based on URL type
    let sourceText = ""
    const isYoutube = url.includes("youtube.com") || url.includes("youtu.be")

    if (isYoutube) {
      try {
        sourceText = await extractYoutubeTranscript(url)
        console.log("Transcript extracted successfully, length:", sourceText.length)
        
        // Check if transcript is too short (might be invalid)
        if (sourceText.length < 50) {
          throw new Error("Transcript is too short. The video may not have proper captions.")
        }
      } catch (error) {
        console.error("YouTube transcript error:", error)
        
        // Provide user-friendly error messages
        let errorMessage = "Failed to extract YouTube transcript"
        
        if (error instanceof Error) {
          if (error.message.includes("Transcript is disabled")) {
            errorMessage = "This video has transcripts disabled. Please try a different video or use a blog URL instead."
          } else if (error.message.includes("No transcript available") || error.message.includes("captions enabled")) {
            errorMessage = "No transcript available for this video. Please ensure the video has captions/subtitles enabled, or try a different video."
          } else if (error.message.includes("private") || error.message.includes("age-restricted")) {
            errorMessage = "Cannot access this video. It may be private, age-restricted, or unavailable."
          } else if (error.message.includes("Invalid YouTube URL")) {
            errorMessage = "Invalid YouTube URL format. Please check the URL and try again."
          } else if (error.message.includes("too short")) {
            errorMessage = "The video transcript is too short to generate meaningful content. Please try a longer video."
          } else if (error.message.includes("No readable text in transcript") || error.message.includes("Transcript data is empty")) { // Added specific error for empty or unreadable transcript
            errorMessage = "The video's transcript is empty or unreadable. Please try a different video."
          }
           else {
            errorMessage = `YouTube Error: ${error.message}`
          }
        }
        
        return NextResponse.json({ 
          message: errorMessage,
          hint: "Try using a YouTube video with auto-generated or manual captions, or provide a blog/article URL instead."
        }, { status: 400 })
      }
    } else {
      // Try to scrape blog content
      try {
        sourceText = await scrapeBlogContent(url)
        console.log("Blog content extracted, length:", sourceText.length)
        
        if (!sourceText || sourceText.length < 100) {
          throw new Error("Insufficient content extracted from the blog")
        }
      } catch (error) {
        console.error("Blog scraping error:", error)
        return NextResponse.json({ 
          message: "Failed to extract content from the provided URL. The page may be protected or inaccessible.",
          hint: "Make sure the URL is a public blog post or article."
        }, { status: 400 })
      }
    }

    if (!sourceText || sourceText.trim().length === 0) {
      return NextResponse.json({ 
        message: "Could not extract any content from the provided URL",
        hint: "Please ensure the URL contains accessible text content."
      }, { status: 400 })
    }

    // Check if content is long enough for meaningful generation
    if (sourceText.length < 100) {
      return NextResponse.json({ 
        message: "The extracted content is too short to generate meaningful posts. Please provide a longer video or article.",
      }, { status: 400 })
    }

    console.log("Generating AI content from source text...")

    // Generate content using AI
    const aiResult = await generateContent(sourceText)
    console.log("AI content generated successfully", aiResult)
    
    // Validate AI result
    if (!aiResult || (!aiResult.tweets && !aiResult.linkedin && !aiResult.email)) {
      throw new Error("Failed to generate content from the source material")
    }

    const generation = await prisma.generation.create({
      data: {
        sourceUrl: url,
        resultTweets: aiResult.tweets || "",
        resultLinkedin: aiResult.linkedin || "",
        resultEmail: aiResult.email || "",
        userId: user.id,
      },
    })

    // Decrement credits
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { credits: user.credits - 1 },
    })

    console.log("Content generated successfully. Generation ID:", generation.id)

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
    
    // Check if it's a database error
    if (error instanceof Error && error.message.includes("Prisma")) {
      return NextResponse.json({ 
        message: "Database error occurred. Please try again later." 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      message: "An unexpected error occurred. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// Helper function to validate URL
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === "http:" || urlObj.protocol === "https:"
  } catch {
    return false
  }
}