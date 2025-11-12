import * as cheerio from "cheerio"

export async function scrapeBlogContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract text from main content areas
    const textParts: string[] = []

    // Get headings and paragraphs
    $("h1, h2, h3, p, article, main, .post-content, .content, .article-body").each((_, element) => {
      const text = $(element).text().trim()
      if (text) {
        textParts.push(text)
      }
    })

    const fullText = textParts.join("\n").trim()

    if (!fullText) {
      throw new Error("No content found on the page")
    }

    // Limit to first 5000 characters to avoid API limits
    return fullText.substring(0, 5000)
  } catch (error) {
    console.error("Blog scraping error:", error)
    throw new Error("Failed to scrape blog content")
  }
}
