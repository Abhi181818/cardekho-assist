import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { buildSystemPrompt } from "@/lib/prompt";

function extractJsonPayload(value) {
  const text = String(value || "").trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const slice = text.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(slice);
      } catch (nestedError) {
        return null;
      }
    }

    return null;
  }
}

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt();
    const raw = await callGemini(systemPrompt, messages);

    const parsed = typeof raw === "string" ? extractJsonPayload(raw) : raw;

    if (!parsed) {
      return NextResponse.json({
        reply: String(raw || "").trim() || "Sorry, I couldn't format that response cleanly. Please try again.",
        stage: "gathering",
        shortlist: [],
        verdict: null,
      });
    }

    return NextResponse.json({ reply: parsed.reply ?? "", stage: parsed.stage ?? "gathering", shortlist: parsed.shortlist ?? [], verdict: parsed.verdict ?? null });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
