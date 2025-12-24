import { NextResponse } from "next/server";
import { runGemini } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const reply = await runGemini(messages);
    
    return NextResponse.json(reply);
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}