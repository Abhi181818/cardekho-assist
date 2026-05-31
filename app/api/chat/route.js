import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { getAllCars } from "@/lib/cars";
import { buildSystemPrompt } from "@/lib/prompt";

const STAGES = new Set(["gathering", "recommending", "done"]);
const inventory = getAllCars();
const inventoryById = new Map(inventory.map((car) => [car.id.toLowerCase(), car]));
const inventoryByLabel = new Map(
  inventory.map((car) => [`${car.make} ${car.model} ${car.variant} ${car.year}`.toLowerCase(), car]),
);

function cleanJsonString(value) {
  return String(value || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/,\s*([}\]])/g, "$1")
    .trim();
}

function extractJsonPayload(value) {
  const text = cleanJsonString(value);

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

function normalizeKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findCarMatch(candidate) {
  if (!candidate) return null;

  const byId = inventoryById.get(String(candidate.id || "").toLowerCase());
  if (byId) return byId;

  const name = [candidate.make, candidate.model, candidate.variant, candidate.year].filter(Boolean).join(" ");
  const byLabel = inventoryByLabel.get(name.toLowerCase());
  if (byLabel) return byLabel;

  const keySource = [candidate.name, candidate.id, candidate.model].find(Boolean);
  const key = normalizeKey(keySource);
  if (!key) return null;

  return (
    inventory.find((car) => {
      const carKey = normalizeKey(`${car.make} ${car.model} ${car.variant} ${car.year}`);
      return carKey.includes(key) || key.includes(carKey);
    }) || null
  );
}

function normalizeShortlist(rawShortlist) {
  if (!Array.isArray(rawShortlist)) return [];

  const normalized = [];
  const seenIds = new Set();

  for (const item of rawShortlist) {
    const source = typeof item === "string" ? { name: item, id: item, model: item } : item;
    const matchedCar = findCarMatch(source);
    if (!matchedCar || seenIds.has(matchedCar.id)) continue;

    normalized.push({
      ...matchedCar,
      reason: source?.reason || source?.why || source?.rationale || source?.summary || "",
      tradeoff: source?.tradeoff || source?.trade_off || source?.cons || "",
    });

    seenIds.add(matchedCar.id);
  }

  return normalized.slice(0, 5);
}

function normalizeResponse(parsed) {
  const shortlist = normalizeShortlist(parsed?.shortlist);
  const fallbackStage = shortlist.length > 0 ? "recommending" : "gathering";
  const stage = STAGES.has(parsed?.stage) ? parsed.stage : fallbackStage;
  const safeStage = stage === "recommending" && shortlist.length === 0 ? "gathering" : stage;
  const verdict =
    shortlist.find((car) => car.id === parsed?.verdict)?.id ||
    (safeStage === "recommending" && shortlist.length > 0 ? shortlist[0].id : null);

  return {
    reply: String(parsed?.reply || "").trim() || "I found options for you. Check the shortlist cards on the right.",
    stage: safeStage,
    shortlist,
    verdict,
  };
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
        reply: "Sorry, I couldn't format that response cleanly. Please try again.",
        stage: "gathering",
        shortlist: [],
        verdict: null,
      });
    }

    return NextResponse.json(normalizeResponse(parsed));
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
