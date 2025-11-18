import { GoogleGenAI } from "@google/genai";

function extractText(result: any): string {
  if (!result?.candidates?.length) return "";

  const candidate = result.candidates[0];

  if (candidate.content?.parts?.length) {
    for (const part of candidate.content.parts) {
      if (typeof part?.text === "string") {
        return part.text.trim();
      }
    }
  }

  const legacyParts = Array.isArray(candidate.content)
    ? candidate.content
    : [candidate.content];

  for (const part of legacyParts) {
    if (typeof part?.text === "string") {
      return part.text.trim();
    }
  }

  return "";
}

export async function generateContent(sourceText: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are an expert social media marketing assistant and content repurposing specialist. Your task is to take a piece of source content and transform it into a structured JSON object containing assets for different platforms.

    Based only on the source content I provide below, generate a single, valid JSON object with the following keys: tweets, linkedin, instagram, facebook, and email.
    
    Key Requirements:
    
    "tweets": (For X/Twitter)
    Must be an array containing exactly 5 unique tweets.
    Each tweet must be under 280 characters.
    The tone should be engaging, catchy, and high-energy.
    Must include 2-3 relevant, high-traffic hashtags.
    Must include at least one relevant emoji.
    Each tweet must highlight a different angle or key takeaway.
    
    "linkedin":
    Must be a single string containing a professional LinkedIn post (approx 150 words).
    Start with a strong hook. Tone: polished, insightful, B2B suitable.
    Structure with short paragraphs for readability.
    End with a clear CTA or question.
    
    "instagram":
    Must be a single string containing an Instagram caption.
    Tone: Casual, visual, and lifestyle-oriented or educational depending on context.
    Include "Link in bio" or similar CTA if relevant.
    Must include a block of 10-15 relevant hashtags at the end.
    
    "facebook":
    Must be a single string containing a Facebook post.
    Tone: Conversational, community-focused, and shareable.
    Slightly longer form than Twitter but more casual than LinkedIn.
    Encourage discussion/comments.
    
    "email":
    Must be a single string containing a concise email newsletter summary (approx 100 words).
    Subject line style hook. Clear value proposition.
    
    Output Constraints:
    Return ONLY the raw, valid JSON object starting with { and ending with }.
    Do NOT include any introductory text, explanations, or markdown formatting like json ...
    `;

    const prompt = `${systemPrompt}\n\nContent:\n${sourceText}`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    // Extract text safely
    let raw = extractText(result);

    if (!raw) {
      console.error("Gemini raw result:", JSON.stringify(result, null, 2));
      throw new Error("Empty response from Gemini");
    }

    // Clean markdown fences
    const cleaned = raw
      .replace(/^```json/, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}$/);
    if (!jsonMatch) {
      console.error("Invalid AI output:", cleaned);
      throw new Error("AI did not return JSON");
    }

    const data = JSON.parse(jsonMatch[0]);

    // Validation
    if (!Array.isArray(data.tweets) || data.tweets.length < 1) throw new Error("Tweets invalid");
    if (typeof data.linkedin !== "string") throw new Error("LinkedIn invalid");
    if (typeof data.email !== "string") throw new Error("Email invalid");
    
    // Allow fallback if AI misses these
    data.instagram = typeof data.instagram === "string" ? data.instagram : "Instagram caption generation failed.";
    data.facebook = typeof data.facebook === "string" ? data.facebook : "Facebook post generation failed.";

    return data;
  } catch (err: any) {
    console.error("Gemini error:", err);
    throw new Error(err.message || "Failed to generate content");
  }
}
