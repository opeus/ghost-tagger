import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as fs from "fs/promises";
import * as path from "path";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";
const PROMPT_PATH = path.join(process.cwd(), "lib", "descriptions-prompt.txt");

const DEFAULT_PROMPT = `Analyze this article and generate THREE descriptions:

Title: {title}
Content: {content}
Existing Tags: {existing_tags}

Generate:
1. CUSTOM EXCERPT (MAXIMUM 300 CHARACTERS) - Most important
2. META DESCRIPTION (MAXIMUM 160 CHARACTERS)
3. OG DESCRIPTION (MAXIMUM 160 CHARACTERS)

Return ONLY valid JSON:
{
  "custom_excerpt": "...",
  "meta_description": "...",
  "og_description": "..."
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

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
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
            maxOutputTokens: 500,
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
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return NextResponse.json(
        { error: "No response from AI" },
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

    // Validate and truncate if necessary
    if (descriptions.custom_excerpt && descriptions.custom_excerpt.length > 300) {
      descriptions.custom_excerpt = descriptions.custom_excerpt.substring(0, 297) + "...";
    }
    if (descriptions.meta_description && descriptions.meta_description.length > 160) {
      descriptions.meta_description = descriptions.meta_description.substring(0, 157) + "...";
    }
    if (descriptions.og_description && descriptions.og_description.length > 160) {
      descriptions.og_description = descriptions.og_description.substring(0, 157) + "...";
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
