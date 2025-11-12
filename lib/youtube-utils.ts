import { YoutubeTranscript } from "youtube-transcript"

export async function extractYoutubeTranscript(url: string): Promise<string> {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(url)

    if (!videoId) {
      throw new Error("Invalid YouTube URL")
    }

    // Fetch transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId)

    // Combine all transcript text
    const fullText = transcript.map((item: any) => item.text).join(" ")

    return fullText
  } catch (error) {
    console.error("YouTube extraction error:", error)
    throw new Error("Failed to extract YouTube transcript")
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}
