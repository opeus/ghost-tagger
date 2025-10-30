import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getPostContent } from "@/lib/ghost";
import { generateTagSuggestions } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId, existingTags } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    // Get post content
    const post = await getPostContent(postId);
    const content = post.plaintext || post.html || "";

    // Generate AI tags
    const suggestedTags = await generateTagSuggestions(
      post.title,
      content,
      existingTags || []
    );

    return NextResponse.json({ suggestedTags });
  } catch (error: any) {
    console.error("Error generating tags:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
