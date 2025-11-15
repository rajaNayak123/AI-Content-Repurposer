import { Innertube } from "youtubei.js";

interface TranscriptConfig {
  lang?: string;
}

export async function extractYoutubeTranscript(
  url: string,
  config: TranscriptConfig = {}
): Promise<string> {
  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  // Suppress youtubei.js warnings
  try {
    (process.env as any).YTJS_NO_WARNINGS = "true";
  } catch {}

  // Temporarily suppress console.warn during YouTube operations
  const originalWarn = console.warn;
  const originalError = console.error;
  
  try {
    // Filter out youtubei.js parser warnings
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      if (
        !message.includes('[YOUTUBEJS]') &&
        !message.includes('CourseProgressView') &&
        !message.includes('Type mismatch') &&
        !message.includes('Unable to find matching run')
      ) {
        originalWarn.apply(console, args);
      }
    };

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      if (
        !message.includes('[YOUTUBEJS]') &&
        !message.includes('CourseProgressView') &&
        !message.includes('Type mismatch')
      ) {
        originalError.apply(console, args);
      }
    };

    const youtube = await Innertube.create({
      logging: false,
      disable_update_check: true,
    } as any);

    let info;
    try {
      info = await youtube.getInfo(videoId);
    } catch (err) {
      // Silent catch - warnings are already suppressed
    }

    if (!info) {
      throw new Error("Failed to load video info");
    }

    let transcriptData: any = null;
    try {
      transcriptData = await info.getTranscript();
    } catch (err) {
      // Silent catch
    }

    // Normalized segments extraction with multiple fallbacks
    const possibleSegments =
      transcriptData?.transcript?.content?.body?.initial_segments ||
      transcriptData?.transcript?.segments ||
      transcriptData?.segments ||
      transcriptData?.items ||
      null;

    // If getTranscript() failed, try probing info.renderer or info.description sections
    let segments = possibleSegments;
    if (!segments || segments.length === 0) {
      const alt =
        // @ts-ignore
        info?.playerCaptions?.captionTracks ||
        // @ts-ignore
        info?.captions ||
        // @ts-ignore
        info?.captions?.captionTracks ||
        null;
      if (alt && Array.isArray(alt) && alt.length) {
        segments = alt.map((a: any) => ({ snippet: { text: a?.text || a?.caption || "" } }));
      }
    }

    if (!segments || segments.length === 0) {
      throw new Error("Transcript seems to be empty or not available for this video");
    }

    // Normalize and join texts from potential different segment structures
    const fullText = segments
      .map((segment: any) => {
        try {
          if (typeof segment === "string") return segment;
          if (segment?.snippet?.text) return segment.snippet.text;
          if (segment?.text) return segment.text;
          if (segment?.snippet?.runs && Array.isArray(segment.snippet.runs)) {
            return segment.snippet.runs.map((r: any) => r?.text || "").join("");
          }
          if (segment?.runs && Array.isArray(segment.runs)) {
            return segment.runs.map((r: any) => r?.text || "").join("");
          }
          return segment?.caption || segment?.content || "";
        } catch (err) {
          return "";
        }
      })
      .filter((t: string) => typeof t === "string" && t.trim().length > 0)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!fullText) {
      throw new Error("Could not extract meaningful transcript text");
    }

    console.log(`Transcript extracted: ${fullText.length} characters`);
    return fullText;
    
  } catch (error: any) {
    const msg = error?.message || String(error);

    // Friendly, actionable errors
    if (msg.includes("parser") || msg.includes("Type mismatch") || msg.includes("CourseProgressView")) {
      throw new Error(
        "YouTube parser error: video may have special structure (course, playlist, or protected content). Try a different video or update youtubei.js."
      );
    }

    if (msg.toLowerCase().includes("unavailable") || msg.toLowerCase().includes("private")) {
      throw new Error("This video is unavailable or private.");
    }

    if (msg.toLowerCase().includes("transcript") || msg.toLowerCase().includes("empty")) {
      throw new Error("Transcript not available for this video.");
    }

    throw new Error(`Failed to extract transcript: ${msg}`);
  } finally {
    // Restore original console methods
    console.warn = originalWarn;
    console.error = originalError;
  }
}

// Helper functions
function extractVideoId(url: string): string | null {
  url = (url || "").trim();
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");

    if (hostname === "youtube.com" || hostname.endsWith(".youtube.com")) {
      if (parsed.searchParams.get("v")) {
        const id = parsed.searchParams.get("v")!;
        return isValidVideoId(id) ? id : null;
      }

      const pathMatch = parsed.pathname.match(/^\/(embed|v|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (pathMatch && pathMatch[2]) return pathMatch[2];
    }

    if (hostname === "youtu.be") {
      const id = parsed.pathname.slice(1).split("?")[0];
      return isValidVideoId(id) ? id : null;
    }
  } catch {
    const patterns = [
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m && m[1] && isValidVideoId(m[1])) return m[1];
    }
  }

  return null;
}

function isValidVideoId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

export function isYoutubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}