import axios from "axios";
import { promises as fs } from "fs";
import path from "path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

const STOP_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with",
  "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her",
  "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up",
  "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time",
  "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think",
  "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even",
  "new", "want", "because", "any", "these", "give", "day", "most", "us", "is", "was", "are", "been",
  "has", "had", "were", "said", "did", "having", "may", "should", "am", "being", "here", "where",
]);

const DEFAULT_PROMPT = `Analyze the following blog article and suggest relevant tags.

Title: {title}

Content: {content}

Existing tags: {existing_tags}

Please provide a list of 10-20 relevant tags for this article. Consider:
- Main topics and themes (most important)
- Target audience and context
- Key concepts and terminology
- Related subjects and categories
- Educational context if applicable
- Industry-specific terms
- Broader topical areas

Think deeply about the article's content, purpose, and audience. Consider both specific and general tags that would help readers discover this content.

Return ONLY the tag names, one per line, without numbering or bullet points. Order them by relevance, with the most important/primary tag first.`;

export interface Keyword {
  word: string;
  count: number;
}

/**
 * Extract keywords from text with frequency counts
 */
export function extractKeywords(text: string, maxKeywords: number = 30): Keyword[] {
  // Remove HTML tags
  let cleanText = text.replace(/<[^>]+>/g, " ");
  // Remove punctuation and convert to lowercase
  cleanText = cleanText.replace(/[^\w\s]/g, " ").toLowerCase();

  // Split into words
  const words = cleanText.split(/\s+/);

  // Filter out stop words and short words
  const keywords = words.filter((word) => word.length > 3 && !STOP_WORDS.has(word));

  // Count frequencies
  const wordCounts = new Map<string, number>();
  keywords.forEach((word) => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  });

  // Convert to array and sort by frequency
  const sortedKeywords = Array.from(wordCounts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, maxKeywords);

  return sortedKeywords;
}

/**
 * Load prompt from file
 */
async function loadPrompt(): Promise<string> {
  try {
    const promptPath = path.join(process.cwd(), "lib", "ai-prompt.txt");
    return await fs.readFile(promptPath, "utf-8");
  } catch (error) {
    console.error("Error loading prompt, using default:", error);
    return DEFAULT_PROMPT;
  }
}

/**
 * Generate tag suggestions using Google Gemini
 */
export async function generateTagSuggestions(
  title: string,
  content: string,
  existingTags: string[]
): Promise<string[]> {
  try {
    // Load prompt from file
    const promptTemplate = await loadPrompt();

    const existingTagsStr = existingTags.length > 0 ? existingTags.join(", ") : "None";
    const prompt = promptTemplate.replace("{title}", title)
      .replace("{content}", content.substring(0, 5000))
      .replace("{existing_tags}", existingTagsStr);

    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      },
      {
        headers: {
          "x-goog-api-key": GEMINI_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;

    // Parse tags from response
    const tags: string[] = [];
    const lines = generatedText.trim().split("\n");

    for (const line of lines) {
      let cleanLine = line.trim().replace(/^[*\-•0-9.\s]+/, "");
      if (cleanLine) {
        // Split by commas if present
        if (cleanLine.includes(",")) {
          const splitTags = cleanLine.split(",").map((t: string) => t.trim()).filter((t: string) => t);
          tags.push(...splitTags);
        } else {
          tags.push(cleanLine);
        }
      }
    }

    return tags.filter((tag) => tag.length > 0);
  } catch (error: any) {
    console.error("Error generating tags:", error.response?.data || error.message);
    throw new Error(`Failed to generate tags: ${error.message}`);
  }
}
