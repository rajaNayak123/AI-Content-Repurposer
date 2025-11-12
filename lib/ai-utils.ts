import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

export async function generateContent(sourceText: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const systemPrompt = `You are an expert social media marketing assistant. Based on the following text, generate a JSON object with three keys:
- 'tweets': an array of exactly 5 short, catchy tweets (each under 280 characters) with relevant hashtags
- 'linkedin': a professional LinkedIn post (around 150 words) suitable for sharing with a professional network
- 'email': a concise email newsletter summary (around 100 words)

Return ONLY valid JSON, no additional text.`

    const prompt = `${systemPrompt}\n\nContent to repurpose:\n\n${sourceText}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const parsedResult = JSON.parse(jsonMatch[0])

    // Validate structure
    if (!Array.isArray(parsedResult.tweets) || parsedResult.tweets.length !== 5) {
      throw new Error("Invalid tweets format")
    }

    if (typeof parsedResult.linkedin !== "string" || !parsedResult.linkedin) {
      throw new Error("Invalid LinkedIn post")
    }

    if (typeof parsedResult.email !== "string" || !parsedResult.email) {
      throw new Error("Invalid email summary")
    }

    return {
      tweets: parsedResult.tweets,
      linkedin: parsedResult.linkedin,
      email: parsedResult.email,
    }
  } catch (error) {
    console.error("AI generation error:", error)
    throw new Error("Failed to generate content")
  }
}
