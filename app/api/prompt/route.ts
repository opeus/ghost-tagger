import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { promises as fs } from "fs";
import path from "path";

const PROMPT_PATH = path.join(process.cwd(), "lib", "ai-prompt.txt");

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prompt = await fs.readFile(PROMPT_PATH, "utf-8");
    return NextResponse.json({ prompt });
  } catch (error: any) {
    console.error("Error reading prompt:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt data" }, { status: 400 });
    }

    // Write to file
    await fs.writeFile(PROMPT_PATH, prompt, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving prompt:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
