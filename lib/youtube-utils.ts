import { Innertube } from "youtubei.js";
import { YoutubeTranscript } from "youtube-transcript";

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

  // Suppress youtubei.js parser warnings
  const originalWarn = console.warn;
  const originalError = console.error;

  const suppressFilter = (...args: any[]) => {
    const message = args.join(" ");
    return (
      message.includes("[YOUTUBEJS]") ||
      message.includes("CourseProgressView") ||
      message.includes("Type mismatch") ||
      message.includes("Unable to find matching run")
    );
  };

  console.warn = (...args: any[]) => {
    if (!suppressFilter(...args)) originalWarn.apply(console, args);
  };
  console.error = (...args: any[]) => {
    if (!suppressFilter(...args)) originalError.apply(console, args);
  };

  try {
    const youtube = await Innertube.create({
      logging: false,
      disable_update_check: true,
    } as any);

    // --- Step 1: Load video info ---
    let info: any;
    try {
      info = await youtube.getInfo(videoId);
    } catch (err: any) {
      throw new Error(`Failed to load video info: ${err?.message || err}`);
    }

    if (!info) {
      throw new Error("Failed to load video info");
    }

    // --- Step 1.5: Attempt youtube-transcript package ---
    try {
      let ytTranscript;
      try {
        ytTranscript = await YoutubeTranscript.fetchTranscript(url, config.lang ? { lang: config.lang } : undefined);
      } catch (err: any) {
        // Fallback to default transcript if requested language or "en" isn't available
        ytTranscript = await YoutubeTranscript.fetchTranscript(url);
      }

      if (ytTranscript && ytTranscript.length > 0) {
        const text = ytTranscript.map((t: any) => t.text).join(" ").replace(/\s+/g, " ").trim();
        console.log(`Transcript extracted via youtube-transcript: ${text.length} characters`);
        return text;
      }
    } catch (ytErr: any) {
      console.log("youtube-transcript failed, falling back to Innertube:", ytErr?.message);
    }

    // --- Step 2: Attempt getTranscript() ---
    let transcriptData: any = null;
    let transcriptError: string | null = null;
    try {
      transcriptData = await info.getTranscript();
    } catch (err: any) {
      transcriptError = err?.message || String(err);
      // Don't throw yet — we'll try caption fallback below
    }

    // --- Step 3: Extract segments from known youtubei.js structures ---
    let segments: any[] | null = null;

    if (transcriptData) {
      // Primary path: youtubei.js >= 2.x
      segments =
        transcriptData?.transcript?.content?.body?.initial_segments ??
        // Some versions wrap differently
        transcriptData?.transcript?.body?.initial_segments ??
        transcriptData?.transcript?.segments ??
        transcriptData?.segments ??
        transcriptData?.items ??
        null;
    }

    // --- Step 4: Caption track fallback ---
    // If getTranscript() failed or returned no segments, try fetching the
    // first available caption track directly via the timedtext API.
    if (!segments || segments.length === 0) {
      try {
        const captionTracks: any[] =
          info?.captions?.caption_tracks ??
          info?.captions?.translationLanguages ?? // older structure
          [];

        if (captionTracks.length > 0) {
          // Prefer the requested language, fall back to first available
          const track =
            captionTracks.find((t: any) =>
              t?.language_code === (config.lang ?? "en")
            ) ?? captionTracks[0];

          const baseUrl: string | undefined =
            track?.base_url ?? track?.url ?? track?.baseUrl;

          if (baseUrl) {
            const resp = await fetch(`${baseUrl}&fmt=json3`);
            if (resp.ok) {
              const json = await resp.json();
              const events: any[] = json?.events ?? [];
              const text = events
                .flatMap((e: any) => e?.segs ?? [])
                .map((s: any) => s?.utf8 ?? "")
                .filter(Boolean)
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();

              if (text) {
                console.log(`Transcript extracted via caption track: ${text.length} characters`);
                return text;
              }
            }
          }
        }
      } catch (captionErr: any) {
        // Caption fallback failed — surface the original transcript error if we have one
      }

      // Nothing worked
      const reason = transcriptError
        ? `getTranscript() failed: ${transcriptError}`
        : "No segments found in transcript response";
      // We don't throw an error here but return a cleaner error message.
      throw new Error("Transcript not available for this video or subtitles are disabled.");
    }

    // --- Step 5: Normalise segment text ---
    // youtubei.js TranscriptSegment stores text in snippet.runs[].text
    // but we also handle plain strings and legacy shapes.
    const fullText = segments
      .map((segment: any) => {
        try {
          if (typeof segment === "string") return segment;

          // Most common shape in recent youtubei.js (TranscriptSegment)
          if (segment?.snippet?.runs && Array.isArray(segment.snippet.runs)) {
            return segment.snippet.runs.map((r: any) => r?.text ?? "").join("");
          }

          // Flat text shapes
          if (typeof segment?.snippet?.text === "string") return segment.snippet.text;
          if (typeof segment?.text === "string") return segment.text;

          // Runs without snippet wrapper
          if (segment?.runs && Array.isArray(segment.runs)) {
            return segment.runs.map((r: any) => r?.text ?? "").join("");
          }

          return segment?.caption ?? segment?.content ?? "";
        } catch {
          return "";
        }
      })
      .filter((t: string) => typeof t === "string" && t.trim().length > 0)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (!fullText) {
      throw new Error("Could not extract meaningful transcript text from segments");
    }

    console.log(`Transcript extracted: ${fullText.length} characters`);
    return fullText;

  } catch (error: any) {
    const msg: string = error?.message || String(error);

    if (msg.includes("parser") || msg.includes("Type mismatch") || msg.includes("CourseProgressView")) {
      throw new Error(
        "YouTube parser error: video may have special structure (course, playlist, or protected content). Try a different video or update youtubei.js."
      );
    }

    if (msg.toLowerCase().includes("unavailable") || msg.toLowerCase().includes("private")) {
      throw new Error("This video is unavailable or private.");
    }

    // Re-throw our own descriptive errors as-is
    if (
      msg.startsWith("Transcript not available") ||
      msg.startsWith("Failed to load video") ||
      msg.startsWith("Invalid YouTube")
    ) {
      throw error;
    }

    throw new Error(`Failed to extract transcript: ${msg}`);
  } finally {
    console.warn = originalWarn;
    console.error = originalError;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractVideoId(url: string): string | null {
  url = (url || "").trim();
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");

    if (hostname === "youtube.com" || hostname.endsWith(".youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return isValidVideoId(v) ? v : null;

      const pathMatch = parsed.pathname.match(/^\/(embed|v|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (pathMatch?.[2]) return pathMatch[2];
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
      if (m?.[1] && isValidVideoId(m[1])) return m[1];
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