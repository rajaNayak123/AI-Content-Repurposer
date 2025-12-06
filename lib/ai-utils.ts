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

export async function generateContent(
  sourceText: string, 
  tone: string = "professional",
  platforms: string[] = ['twitter', 'linkedin', 'instagram', 'facebook', 'email']
) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    const ai = new GoogleGenAI({ apiKey });

    // Map tone to detailed descriptions for better AI understanding
    const toneDescriptions: Record<string, string> = {
      professional: "polished, insightful, and business-appropriate",
      casual: "relaxed, friendly, and conversational",
      funny: "humorous, witty, and entertaining with light-hearted jokes",
      controversial: "bold, thought-provoking, and debate-sparking (while remaining respectful)",
      inspirational: "motivational, uplifting, and empowering",
      educational: "informative, clear, and teaching-focused"
    };

    const toneDescription = toneDescriptions[tone.toLowerCase()] || toneDescriptions.professional;

    // Build platform-specific instructions dynamically
    const platformInstructions: Record<string, string> = {
      twitter: `"twitter": (For X/Twitter)
Must be an array containing exactly 5 unique tweets.
Each tweet must be under 280 characters.
The tone should be ${toneDescription}.
Must include 2-3 relevant, high-traffic hashtags.
Must include at least one relevant emoji.
Each tweet must highlight a different angle or key takeaway.`,

      linkedin: `"linkedin":
Must be a single string containing a professional LinkedIn post (approx 150 words).
Start with a strong hook. Tone: ${toneDescription}.
Structure with short paragraphs for readability.
End with a clear CTA or question.`,

      instagram: `"instagram":
Must be a single string containing an Instagram caption.
Tone: ${toneDescription}.
Include "Link in bio" or similar CTA if relevant.
Must include a block of 10-15 relevant hashtags at the end.`,

      facebook: `"facebook":
Must be a single string containing a Facebook post.
Tone: ${toneDescription}.
Slightly longer form than Twitter but more casual than LinkedIn.
Encourage discussion/comments.`,

      email: `"email":
Must be a single string containing a concise email newsletter summary (approx 100 words).
Tone: ${toneDescription}.
Subject line style hook. Clear value proposition.`
    };

    // Build the JSON structure specification
    const platformKeys = platforms.map(p => `"${p}"`).join(', ');
    const selectedInstructions = platforms
      .map(p => platformInstructions[p])
      .filter(Boolean)
      .join('\n\n');

    const systemPrompt = `You are an expert social media marketing assistant and content repurposing specialist. Your task is to take a piece of source content and transform it into a structured JSON object containing assets for different platforms.

IMPORTANT: The user has selected a "${tone}" tone. All content you generate must reflect this tone: ${toneDescription}.

Based only on the source content I provide below, generate a single, valid JSON object with the following keys: ${platformKeys}.

Key Requirements:

${selectedInstructions}

Output Constraints:
Return ONLY the raw, valid JSON object starting with { and ending with }.
Do NOT include any introductory text, explanations, or markdown formatting like \`\`\`json ...\`\`\`
Only include the platforms requested: ${platformKeys}
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

    // Validation - only validate fields that were requested
    // Fixed: Check for 'twitter' key (not 'tweets')
    if (platforms.includes('twitter')) {
      if (!Array.isArray(data.twitter) || data.twitter.length < 1) {
        console.error("Twitter data invalid:", data.twitter);
        throw new Error("Twitter content generation failed - expected array of tweets");
      }
    }

    if (platforms.includes('linkedin')) {
      if (typeof data.linkedin !== "string" || data.linkedin.length < 10) {
        console.error("LinkedIn data invalid:", data.linkedin);
        throw new Error("LinkedIn content generation failed");
      }
    }

    if (platforms.includes('email')) {
      if (typeof data.email !== "string" || data.email.length < 10) {
        console.error("Email data invalid:", data.email);
        throw new Error("Email content generation failed");
      }
    }

    if (platforms.includes('instagram')) {
      if (typeof data.instagram !== "string" || data.instagram.length < 10) {
        console.error("Instagram data invalid, using fallback");
        data.instagram = "Instagram caption generation failed.";
      }
    }

    if (platforms.includes('facebook')) {
      if (typeof data.facebook !== "string" || data.facebook.length < 10) {
        console.error("Facebook data invalid, using fallback");
        data.facebook = "Facebook post generation failed.";
      }
    }

    // Return only the requested platforms
    const result_data: Record<string, any> = {};
    platforms.forEach(platform => {
      if (data[platform] !== undefined) {
        result_data[platform] = data[platform];
      }
    });

    return result_data;
  } catch (err: any) {
    console.error("Gemini error:", err);
    throw new Error(err.message || "Failed to generate content");
  }
}
