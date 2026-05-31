# CarDekho AI Car Advisor — Full Implementation Plan

> **Stack:** Next.js 14 (App Router, JavaScript) · Tailwind CSS · Google Gemini API  
> **Time budget:** 2–3 hours · **Deploy target:** Vercel

---

## Table of Contents

1. [What We're Building](#1-what-were-building)
2. [Architecture Overview](#2-architecture-overview)
3. [Folder Structure](#3-folder-structure)
4. [Data Schema](#4-data-schema)
5. [Phase-by-Phase Build Plan](#5-phase-by-phase-build-plan)
   - [Phase 1 — Scaffold + Data Layer](#phase-1--scaffold--data-layer-20-min)
   - [Phase 2 — Gemini AI Brain](#phase-2--gemini-ai-brain-25-min)
   - [Phase 3 — Frontend UI](#phase-3--frontend-ui-50-min)
   - [Phase 4 — Deploy + README](#phase-4--deploy--readme-20-min)
6. [Key File Implementations](#6-key-file-implementations)
7. [Environment Variables](#7-environment-variables)
8. [Smoke Tests](#8-smoke-tests)
9. [Deliberate Cuts](#9-deliberate-cuts)
10. [If You Had 4 More Hours](#10-if-you-had-4-more-hours)

---

## 1. What We're Building

A **conversational car advisor** — the buyer types in plain English ("I need a family car under ₹15L that's good on highways"), and the app:

1. Asks 2–3 smart clarifying follow-up questions (budget, fuel, use case, seating, must-haves)
2. Returns a **ranked shortlist of 3–5 cars** with a plain-English reason per car
3. Highlights a **top pick** with a verdict
4. Supports follow-ups ("any diesel options?", "what about safety?") without resetting

**Why this scope?** Buyers don't know specs — they know problems. Replacing filter dropdowns with conversation is the highest-value thing shippable in 2–3 hours.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│   ┌─────────────────┐        ┌───────────────────────────┐  │
│   │   Chat Panel    │        │     Shortlist Panel       │  │
│   │  (left column)  │        │     (right column)        │  │
│   │                 │        │                           │  │
│   │  User messages  │        │  CarCard × 3–5            │  │
│   │  AI replies     │        │  Top Pick badge           │  │
│   │  Input box      │        │  Reason snippets          │  │
│   └────────┬────────┘        └───────────────────────────┘  │
│            │  fetch POST /api/chat                           │
└────────────┼────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js App Router                        │
│                                                             │
│   app/api/chat/route.js                                     │
│   ┌─────────────────────────────────────┐                   │
│   │  1. Parse incoming message history  │                   │
│   │  2. Load car context from cars.json │                   │
│   │  3. Build Gemini prompt             │                   │
│   │  4. Call Gemini API                 │                   │
│   │  5. Parse JSON response             │                   │
│   │  6. Return { reply, shortlist,      │                   │
│   │             stage, verdict }        │                   │
│   └─────────────────────────────────────┘                   │
│                        │                                    │
│                        ▼                                    │
│   lib/cars.js      lib/gemini.js     lib/prompt.js          │
│   getAllCars()     createClient()    buildSystemPrompt()     │
│   getCarContext()  callGemini()      buildUserMessage()      │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Gemini API (gemini-1.5-flash)           │
│  Input:  System prompt + car data + conversation history    │
│  Output: JSON { reply, shortlist[], stage, verdict }        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow (per request)

```
User types message
       │
       ▼
ChatPanel → POST /api/chat  { messages: [...history] }
       │
       ▼
route.js loads cars.json → getCarContext() → compact string
       │
       ▼
buildSystemPrompt() injects car context + JSON output rules
       │
       ▼
callGemini() sends to gemini-1.5-flash
       │
       ▼
Parse JSON from response text
       │
       ├──► reply    → stream into ChatPanel bubble
       ├──► shortlist → hydrate ShortlistPanel cards
       ├──► stage     → "gathering" | "recommending" | "done"
       └──► verdict   → highlight top pick card
```

---

## 3. Folder Structure

```
cardekho-advisor/
│
├── app/                          # Next.js App Router
│   ├── layout.js                 # Root layout, Tailwind, metadata
│   ├── page.js                   # Home page — two-column shell
│   ├── globals.css               # Tailwind directives + custom vars
│   └── api/
│       └── chat/
│           └── route.js          # POST handler → Gemini → JSON
│
├── components/
│   ├── ChatPanel.js              # Left col: message list + input
│   ├── MessageBubble.js          # Single chat message (user/ai)
│   ├── ShortlistPanel.js         # Right col: car cards list
│   ├── CarCard.js                # Individual car card
│   └── LoadingDots.js            # Typing indicator
│
├── lib/
│   ├── cars.js                   # Data helpers (getAllCars, getCarContext)
│   ├── gemini.js                 # Gemini client + callGemini()
│   └── prompt.js                 # System prompt builder
│
├── data/
│   └── cars.json                 # 40 seed cars (Indian market)
│
├── hooks/
│   └── useChat.js                # Chat state + API call logic
│
├── .env.local                    # GEMINI_API_KEY=...
├── .eslintrc.json
├── next.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 4. Data Schema

### `data/cars.json` — each car object

```json
{
  "id": "maruti-swift-vxi-2024",
  "make": "Maruti Suzuki",
  "model": "Swift",
  "variant": "VXI",
  "year": 2024,
  "price_lakh": 7.19,
  "fuel": "Petrol",
  "transmission": "Manual",
  "body_type": "Hatchback",
  "seating": 5,
  "mileage_kmpl": 23.2,
  "engine_cc": 1197,
  "safety_rating": 3,
  "user_rating": 4.2,
  "city_suitable": true,
  "highway_suitable": false,
  "boot_space_litres": 268,
  "ground_clearance_mm": 163,
  "tags": ["budget", "city", "first-car", "fuel-efficient", "hatchback"]
}
```

### Car context string (what Gemini sees)

```
Maruti Swift VXI 2024 | ₹7.19L | Petrol Manual | Hatchback | 5S | 23.2kmpl | Safety:3/5 | city,budget,first-car
Hyundai Creta SX 2024 | ₹17.4L | Petrol CVT | SUV | 5S | 17.4kmpl | Safety:5/5 | highway,family,premium
...
```

One line per car — compact, token-efficient, structured.

---

## 5. Phase-by-Phase Build Plan

---

### Phase 1 — Scaffold + Data Layer (20 min)

#### Step 1.1 — Create Next.js app

```bash
npx create-next-app@latest cardekho-advisor \
  --js \
  --tailwind \
  --app \
  --no-src-dir \
  --eslint \
  --no-typescript

cd cardekho-advisor
npm install @google/generative-ai
```

#### Step 1.2 — Create `.env.local`

```env
GEMINI_API_KEY=your_api_key_here
```

Get your key at: https://aistudio.google.com/app/apikey (free tier works fine)

#### Step 1.3 — Create `data/cars.json`

Seed with 35–40 cars covering these body types and price bands:

| Body type | Budget (< ₹8L)            | Mid (₹8–15L)              | Premium (₹15L+)        |
| --------- | ------------------------- | ------------------------- | ---------------------- |
| Hatchback | Swift, WagonR, Tata Tiago | Baleno, i20, Altroz       | —                      |
| Sedan     | —                         | Honda Amaze, Maruti Dzire | Honda City, Verna      |
| SUV (5S)  | —                         | Nexon, Venue, Brezza      | Creta, Seltos          |
| SUV (7S)  | —                         | —                         | Ertiga, Innova, Safari |
| EV        | —                         | Tiago EV                  | Nexon EV, MG ZS EV     |

#### Step 1.4 — Create `lib/cars.js`

```js
import carsData from "@/data/cars.json";

export function getAllCars() {
  return carsData;
}

export function getCarContext() {
  return carsData
    .map(
      (c) =>
        `${c.make} ${c.model} ${c.variant} ${c.year} | ` +
        `₹${c.price_lakh}L | ${c.fuel} ${c.transmission} | ` +
        `${c.body_type} | ${c.seating}S | ${c.mileage_kmpl}kmpl | ` +
        `Safety:${c.safety_rating}/5 | Rating:${c.user_rating}/5 | ` +
        `Boot:${c.boot_space_litres}L | Tags:${c.tags.join(",")}`,
    )
    .join("\n");
}
```

**Verify it works:**

```bash
node -e "const {getCarContext} = require('./lib/cars'); console.log(getCarContext().slice(0,400))"
```

---

### Phase 2 — Gemini AI Brain (25 min)

#### Step 2.1 — Create `lib/gemini.js`

```js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export function getGeminiModel() {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

export async function callGemini(systemPrompt, messages) {
  const model = getGeminiModel();

  // Gemini uses "history" for prior turns, last message is the current one
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1];

  const chat = model.startChat({
    history,
    systemInstruction: systemPrompt,
    generationConfig: {
      maxOutputTokens: 1500,
      temperature: 0.4, // Low temp = more consistent JSON
    },
  });

  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}
```

#### Step 2.2 — Create `lib/prompt.js`

```js
import { getCarContext } from "./cars";

export function buildSystemPrompt() {
  const carContext = getCarContext();

  return `
You are Abhi, a friendly and knowledgeable car advisor at CarDekho India.
Your job is to help confused buyers go from "I don't know what to buy"
to a confident shortlist in just a few messages.

## Car Inventory
You have access to exactly these cars. Never recommend a car not in this list.

${carContext}

## Conversation Strategy
- GATHERING stage: Ask at most 2 smart questions per turn to understand:
  budget, primary use (city/highway/both), fuel preference, seating needs,
  must-have features, first car or upgrade?
- RECOMMENDING stage: Once you have enough info (usually after 1–2 turns),
  return your top 3–5 picks ranked by fit.
- Support follow-up questions without resetting the shortlist.

## Output Format — CRITICAL
You MUST always respond with valid JSON only. No markdown fences, no extra text.

{
  "reply": "Conversational message to the user (1–3 sentences)",
  "stage": "gathering" | "recommending" | "done",
  "shortlist": [
    {
      "id": "car-id-from-inventory",
      "make": "Maruti Suzuki",
      "model": "Swift",
      "variant": "VXI",
      "price_lakh": 7.19,
      "fuel": "Petrol",
      "body_type": "Hatchback",
      "mileage_kmpl": 23.2,
      "safety_rating": 3,
      "seating": 5,
      "reason": "One sentence explaining why this car fits THIS buyer specifically",
      "tradeoff": "One honest weakness relevant to their needs"
    }
  ],
  "verdict": "car-id-of-top-pick or null if still gathering"
}

## Rules
- shortlist is [] while stage is "gathering"
- shortlist has 3–5 items when stage is "recommending"
- verdict must be the id of one car from shortlist, or null
- reason and tradeoff must be personalised to what the user told you
- Keep reply warm, concise, and jargon-free
- Never recommend cars outside the inventory list
- Prices are in Indian Rupees (Lakhs). ₹1L = ₹1,00,000
`.trim();
}
```

#### Step 2.3 — Create `app/api/chat/route.js`

````js
import { NextResponse } from "next/server";
import { callGemini } from "@/lib/gemini";
import { buildSystemPrompt } from "@/lib/prompt";

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 },
      );
    }

    const systemPrompt = buildSystemPrompt();
    const rawResponse = await callGemini(systemPrompt, messages);

    // Strip any accidental markdown code fences
    const cleaned = rawResponse
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      reply: parsed.reply ?? "",
      stage: parsed.stage ?? "gathering",
      shortlist: parsed.shortlist ?? [],
      verdict: parsed.verdict ?? null,
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
````

#### Step 2.4 — Smoke test the API

```bash
npm run dev
# in a new terminal:
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "I need a car for under 12 lakhs, mostly city driving" }
    ]
  }'
```

Expected: valid JSON with `stage: "gathering"` and a follow-up question in `reply`.

---

### Phase 3 — Frontend UI (50 min)

#### Step 3.1 — `hooks/useChat.js` — all state in one place

```js
import { useState, useCallback } from "react";

export function useChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm Abhi, your CarDekho advisor. Tell me what you're looking for — budget, how you'll use the car, anything — and I'll find your best options.",
    },
  ]);
  const [shortlist, setShortlist] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const [stage, setStage] = useState("gathering");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    async (content) => {
      const newMessages = [...messages, { role: "user", content }];
      setMessages(newMessages);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });

        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
        if (data.shortlist?.length) setShortlist(data.shortlist);
        if (data.verdict) setVerdict(data.verdict);
        if (data.stage) setStage(data.stage);
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [messages],
  );

  return { messages, shortlist, verdict, stage, loading, error, sendMessage };
}
```

#### Step 3.2 — `app/page.js` — two-column shell

```jsx
"use client";
import { useChat } from "@/hooks/useChat";
import ChatPanel from "@/components/ChatPanel";
import ShortlistPanel from "@/components/ShortlistPanel";

export default function Home() {
  const chat = useChat();

  return (
    <main className="flex h-screen bg-gray-50">
      {/* Left: Chat */}
      <div className="flex flex-col w-full md:w-1/2 border-r border-gray-200 bg-white">
        <header className="px-6 py-4 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-900">
            CarDekho AI Advisor
          </h1>
          <p className="text-sm text-gray-500">
            Tell me what you need. I'll find your car.
          </p>
        </header>
        <ChatPanel
          messages={chat.messages}
          loading={chat.loading}
          error={chat.error}
          onSend={chat.sendMessage}
        />
      </div>

      {/* Right: Shortlist */}
      <div className="hidden md:flex flex-col w-1/2 overflow-y-auto">
        <ShortlistPanel
          shortlist={chat.shortlist}
          verdict={chat.verdict}
          stage={chat.stage}
        />
      </div>
    </main>
  );
}
```

#### Step 3.3 — `components/ChatPanel.js`

```jsx
"use client";
import { useRef, useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";
import LoadingDots from "./LoadingDots";

export default function ChatPanel({ messages, loading, error, onSend }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {loading && <LoadingDots />}
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-6 py-4 border-t border-gray-100"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Family car under ₹15L, mostly highway..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg
                       hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

#### Step 3.4 — `components/CarCard.js`

```jsx
import { useState } from "react";

export default function CarCard({ car, isTopPick }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`
      rounded-xl border p-4 transition-all
      ${
        isTopPick
          ? "border-green-400 bg-green-50 shadow-sm"
          : "border-gray-200 bg-white"
      }
    `}
    >
      {isTopPick && (
        <span
          className="inline-block mb-2 px-2 py-0.5 text-xs font-medium
                         bg-green-100 text-green-800 rounded-full"
        >
          ✓ Top Pick
        </span>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">
            {car.make} {car.model}
          </h3>
          <p className="text-sm text-gray-500">
            {car.variant} · {car.fuel}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">₹{car.price_lakh}L</p>
          <p className="text-xs text-gray-400">{car.mileage_kmpl} kmpl</p>
        </div>
      </div>

      <div className="flex gap-3 mt-3 text-xs text-gray-500">
        <span>🛡 {car.safety_rating}/5</span>
        <span>👥 {car.seating} seats</span>
        <span>⛽ {car.fuel}</span>
      </div>

      <p className="mt-3 text-sm text-gray-700">{car.reason}</p>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-xs text-blue-500 hover:underline"
      >
        {expanded ? "Hide details ↑" : "See tradeoffs ↓"}
      </button>

      {expanded && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          ⚠ {car.tradeoff}
        </p>
      )}
    </div>
  );
}
```

#### Step 3.5 — `components/ShortlistPanel.js`

```jsx
import CarCard from "./CarCard";

export default function ShortlistPanel({ shortlist, verdict, stage }) {
  if (stage === "gathering" || shortlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-10">
        <div className="text-5xl mb-4">🚗</div>
        <h2 className="text-lg font-semibold text-gray-700">
          Your shortlist will appear here
        </h2>
        <p className="text-sm text-gray-400 mt-2">
          Answer a few questions on the left and I'll find your best matches.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">
        Your Shortlist ({shortlist.length} cars)
      </h2>
      <div className="space-y-4">
        {shortlist.map((car) => (
          <CarCard key={car.id} car={car} isTopPick={car.id === verdict} />
        ))}
      </div>
    </div>
  );
}
```

#### Step 3.6 — `components/MessageBubble.js` and `LoadingDots.js`

```jsx
// MessageBubble.js
export default function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
        max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed
        ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
        }
      `}
      >
        {content}
      </div>
    </div>
  );
}
```

```jsx
// LoadingDots.js
export default function LoadingDots() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
```

---

### Phase 4 — Deploy + README (20 min)

#### Step 4.1 — Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial car advisor implementation"
gh repo create cardekho-advisor --public --push
```

#### Step 4.2 — Deploy to Vercel

```bash
npx vercel

# When prompted:
# - Link to existing project? No
# - Project name: cardekho-advisor
# - Root directory: ./
# - Override settings? No

# Set environment variable:
npx vercel env add GEMINI_API_KEY
# paste your key when prompted

# Redeploy with env:
npx vercel --prod
```

#### Step 4.3 — Verify live URL

Hit your Vercel URL, send a message, confirm the shortlist panel populates.

---

## 6. Key File Implementations

### `app/layout.js`

```jsx
import "./globals.css";

export const metadata = {
  title: "CarDekho AI Advisor",
  description: "Find your perfect car with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

### `next.config.js`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
```

---

## 7. Environment Variables

| Variable         | Where to get it                        | Required |
| ---------------- | -------------------------------------- | -------- |
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey | Yes      |

Add to `.env.local` for local dev. Add to Vercel dashboard (or via CLI) for production.

**Never commit `.env.local` to git.** It's in `.gitignore` by default.

---

## 8. Smoke Tests

Run these in order before building the UI. Each one gates the next phase.

```bash
# 1. Verify car data loads
node -e "const c = require('./lib/cars'); console.log(c.getAllCars().length, 'cars loaded')"

# 2. Verify context string is readable
node -e "const c = require('./lib/cars'); console.log(c.getCarContext().split('\n').slice(0,3).join('\n'))"

# 3. Verify API route (server must be running: npm run dev)
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"I need a budget hatchback"}]}' | jq .

# 4. Verify shortlist populates after context
curl -s -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role":"user","content":"Looking for a car under 8 lakhs, mostly city"},
      {"role":"assistant","content":"Great! Is this your first car? And any preference on fuel — petrol or CNG?"},
      {"role":"user","content":"First car, petrol is fine, just want good mileage"}
    ]
  }' | jq '.shortlist | length'
# Expected: 3, 4, or 5
```

---

## 9. Deliberate Cuts

| Cut                          | Why                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------ |
| Database (Postgres/Supabase) | `cars.json` is sufficient for 40 cars. Saves 30 min of DB setup that adds zero user value. |
| Auth / user sessions         | Not in the brief. Would cost ~45 min.                                                      |
| Filter/sort UI dropdowns     | That's what we're _replacing_ with AI. Would contradict the product bet.                   |
| Real car images              | Placeholder by body type is fine. Live image fetching adds CDN complexity.                 |
| Full test suite              | One smoke test per layer is enough to signal awareness without ceremony.                   |
| Streaming responses          | Adds complexity (SSE/ReadableStream parsing). Full JSON response is fast enough for MVP.   |
| Compare table UI             | Nice to have, but cards with tradeoffs deliver the same value faster.                      |

---

## 10. If You Had 4 More Hours

1. **Streaming responses** — use Gemini's streaming API + SSE to make the reply feel live
2. **Conversation persistence** — Neon (serverless Postgres) + shareable `/session/[id]` URLs
3. **Side-by-side spec comparison** — select 2–3 cars from shortlist, show a diff table
4. **Vector search** — embed car descriptions with Gemini embeddings + pgvector for semantic matching beyond tags
5. **Mobile drawer UX** — shortlist slides up from bottom as a sheet on small screens
6. **Live price data** — Playwright scrape from CarDekho.com on a daily cron

---

## Quick Reference — Build Order

```
Phase 1 (20 min)   npx create-next-app → cars.json → lib/cars.js
Phase 2 (25 min)   lib/gemini.js → lib/prompt.js → api/chat/route.js → smoke test
Phase 3 (50 min)   hooks/useChat.js → page.js → ChatPanel → CarCard → ShortlistPanel
Phase 4 (20 min)   GitHub push → Vercel deploy → README → start recording Loom
```

Total: ~2 hours of focused build time + buffer for debugging.
