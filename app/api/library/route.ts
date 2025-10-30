import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { promises as fs } from "fs";
import path from "path";

const LIBRARY_PATH = path.join(process.cwd(), "lib", "tag-library.json");

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fileContent = await fs.readFile(LIBRARY_PATH, "utf-8");
    const library = JSON.parse(fileContent);
    return NextResponse.json({ library });
  } catch (error: any) {
    console.error("Error reading library:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { library } = await request.json();

    if (!library || typeof library !== "object") {
      return NextResponse.json({ error: "Invalid library data" }, { status: 400 });
    }

    // Write to file with pretty formatting
    await fs.writeFile(LIBRARY_PATH, JSON.stringify(library, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving library:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
