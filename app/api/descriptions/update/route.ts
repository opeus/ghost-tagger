import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { updateGhostPost } from "@/lib/ghost";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId, custom_excerpt, meta_description, og_description } = await request.json();

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
    if (meta_description && meta_description.length > 160) {
      return NextResponse.json(
        { error: "Meta description cannot exceed 160 characters" },
        { status: 400 }
      );
    }
    if (og_description && og_description.length > 160) {
      return NextResponse.json(
        { error: "OG description cannot exceed 160 characters" },
        { status: 400 }
      );
    }

    // Build update payload - only include provided fields
    const updateData: any = {};
    if (custom_excerpt !== undefined) updateData.custom_excerpt = custom_excerpt;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (og_description !== undefined) updateData.og_description = og_description;

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
