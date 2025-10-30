import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { updatePostTags } from "@/lib/ghost";

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId, tags } = await request.json();

    if (!postId || !tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: "Post ID and tags array are required" },
        { status: 400 }
      );
    }

    await updatePostTags(postId, tags);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating tags:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
