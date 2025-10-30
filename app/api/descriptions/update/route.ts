import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { updateGhostPost } from "@/lib/ghost";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      postId,
      custom_excerpt,
      meta_title,
      meta_description,
      og_title,
      og_description,
      twitter_title,
      twitter_description
    } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Validate character limits
    if (custom_excerpt && custom_excerpt.length > 300) {
      return NextResponse.json(
        { error: "Custom excerpt cannot exceed 300 characters" },
        { status: 400 }
      );
    }
    if (meta_title && meta_title.length > 60) {
      return NextResponse.json(
        { error: "Meta title cannot exceed 60 characters" },
        { status: 400 }
      );
    }
    if (meta_description && meta_description.length > 160) {
      return NextResponse.json(
        { error: "Meta description cannot exceed 160 characters" },
        { status: 400 }
      );
    }
    if (og_title && og_title.length > 60) {
      return NextResponse.json(
        { error: "OG title cannot exceed 60 characters" },
        { status: 400 }
      );
    }
    if (og_description && og_description.length > 160) {
      return NextResponse.json(
        { error: "OG description cannot exceed 160 characters" },
        { status: 400 }
      );
    }
    if (twitter_title && twitter_title.length > 60) {
      return NextResponse.json(
        { error: "Twitter title cannot exceed 60 characters" },
        { status: 400 }
      );
    }
    if (twitter_description && twitter_description.length > 200) {
      return NextResponse.json(
        { error: "Twitter description cannot exceed 200 characters" },
        { status: 400 }
      );
    }

    // Build update payload - only include provided fields
    const updateData: any = {};
    if (custom_excerpt !== undefined) updateData.custom_excerpt = custom_excerpt;
    if (meta_title !== undefined) updateData.meta_title = meta_title;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (og_title !== undefined) updateData.og_title = og_title;
    if (og_description !== undefined) updateData.og_description = og_description;
    if (twitter_title !== undefined) updateData.twitter_title = twitter_title;
    if (twitter_description !== undefined) updateData.twitter_description = twitter_description;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No descriptions provided to update" },
        { status: 400 }
      );
    }

    // Update Ghost post
    const result = await updateGhostPost(postId, updateData);

    return NextResponse.json({
      success: true,
      post: result,
    });
  } catch (error: any) {
    console.error("Error updating descriptions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update descriptions" },
      { status: 500 }
    );
  }
}
