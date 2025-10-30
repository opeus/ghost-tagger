import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAllPosts } from "@/lib/ghost";

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await getAllPosts();
    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
