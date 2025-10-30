import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as fs from "fs/promises";
import * as path from "path";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";
const PROMPT_PATH = path.join(process.cwd(), "lib", "descriptions-prompt.txt");

const DEFAULT_PROMPT = `Analyze this article and generate metadata for SEO and social media:

Title: {title}
Content: {content}
Existing Tags: {existing_tags}

Generate 7 fields (can be similar/same across platforms):
1. CUSTOM EXCERPT (300 chars) - Most important
2. META TITLE (60 chars)
3. META DESCRIPTION (160 chars)
4. OG TITLE (60 chars)
5. OG DESCRIPTION (160 chars)
6. TWITTER TITLE (60 chars)
7. TWITTER DESCRIPTION (200 chars)

IMPORTANT:
- ALL 7 FIELDS ARE REQUIRED - Do not omit any field
- You can use the same text across similar fields
- If a field would be the same as another, still include it in the output

Return ONLY valid JSON with ALL 7 FIELDS:
{
  "custom_excerpt": "...",
  "meta_title": "...",
  "meta_description": "...",
  "og_title": "...",
  "og_description": "...",
  "twitter_title": "...",
  "twitter_description": "..."
}`;

async function loadPrompt(): Promise<string> {
  try {
    return await fs.readFile(PROMPT_PATH, "utf-8");
  } catch (error) {
    console.error("Error loading descriptions prompt, using default:", error);
    return DEFAULT_PROMPT;
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, existingTags } = await request.json();

    console.log("Received request - Title:", title, "Content length:", content?.length || 0);

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required", receivedTitle: !!title, receivedContent: !!content },
        { status: 400 }
      );
    }

    // Load prompt template
    const promptTemplate = await loadPrompt();
    const existingTagsStr = existingTags && existingTags.length > 0
      ? existingTags.join(", ")
      : "None";

    // Replace placeholders
    const prompt = promptTemplate
      .replace("{title}", title)
      .replace("{content}", content.substring(0, 5000)) // Limit content length
      .replace("{existing_tags}", existingTagsStr);

    // Call Gemini API
    const geminiResponse = await fetch(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { error: "Failed to generate descriptions" },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();

    // Log the full response for debugging
    console.log("Gemini API response:", JSON.stringify(geminiData, null, 2));

    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error("No text in Gemini response. Full response:", geminiData);
      return NextResponse.json(
        {
          error: "No response from AI",
          details: geminiData.candidates?.[0]?.finishReason || "Unknown reason",
          fullResponse: geminiData
        },
        { status: 500 }
      );
    }

    // Parse JSON from response
    let descriptions;
    try {
      // Remove markdown code blocks if present
      const cleanText = generatedText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      descriptions = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", generatedText);
      return NextResponse.json(
        { error: "Failed to parse AI response", rawResponse: generatedText },
        { status: 500 }
      );
    }

    // Only enforce hard limit on custom_excerpt (Ghost requirement)
    // Other fields can be slightly longer - Ghost is flexible with them
    if (descriptions.custom_excerpt && descriptions.custom_excerpt.length > 300) {
      descriptions.custom_excerpt = descriptions.custom_excerpt.substring(0, 297) + "...";
    }

    return NextResponse.json({ descriptions });
  } catch (error: any) {
    console.error("Error generating descriptions:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
