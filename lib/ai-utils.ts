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

    const systemPrompt = ` You are an expert social media marketing assistant and content repurposing specialist. Your task is to take a piece of source content and transform it into a structured JSON object containing assets for different platforms.

    Based only on the source content I provide below, generate a single, valid JSON object with the following keys: tweets, linkedin, email, and imagePrompts.
    
    Key Requirements:
    
    "tweets":
    Must be an array containing exactly 5 unique tweets.
    Each tweet must be under 280 characters.
    The tone should be engaging, catchy, and high-energy.
    Must include 2-3 relevant, high-traffic hashtags.
    Must include at least one relevant emoji.
    Each of the 5 tweets must highlight a different, unique angle or key takeaway from the source content.
    
    "linkedin":
    Must be a single string containing a professional LinkedIn post (approximately 150 words).
    It must start with a strong, compelling hook to stop the scroll.
    The tone must be polished, insightful, and suitable for a professional or B2B audience.
    It should summarize the core insights, provide clear value, and position the content as a must-read.
    It must end with a clear call-to-action (CTA) or an engaging question.
    
    "email":
    Must be a single string containing a concise email newsletter summary (approximately 100 words).
    The style should be clear, compelling, and scannable.
    It should act as a "teaser," summarizing the main idea and building curiosity.
    It should clearly state why this content is valuable to the reader.
    
    "imagePrompts":
    Must be an array containing exactly 3 distinct image generation prompts.
    Each prompt should be highly descriptive, focusing on visual elements, lighting, artistic style (e.g., "photorealistic", "minimalist", "cyberpunk"), and composition.
    Designed to be copy-pasted into tools like Midjourney, DALL-E, or Stable Diffusion.
    Example: "A futuristic workspace with glowing blue neon lights, cinematic lighting, hyper-realistic, 8k --ar 16:9"
    
    Output Constraints:
    You must return ONLY the raw, valid JSON object.
    Your response must start with { and end with }.
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

    if (!Array.isArray(data.tweets) || data.tweets.length !== 5)
      throw new Error("Tweets invalid");

    if (typeof data.linkedin !== "string") throw new Error("LinkedIn invalid");

    if (typeof data.email !== "string") throw new Error("Email invalid");

    if (!Array.isArray(data.imagePrompts) || data.imagePrompts.length !== 3) {
      // Fallback to empty array if AI fails this part, or throw error. 
      // Let's safeguard it by defaulting if missing, but logging it.
      console.warn("Image prompts missing or invalid, defaulting to empty.");
      data.imagePrompts = data.imagePrompts || [];
   }

    return data;
  } catch (err: any) {
    console.error("Gemini error:", err);
    throw new Error(err.message || "Failed to generate content");
  }
}
