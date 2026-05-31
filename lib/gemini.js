// Gemini / Generative Language integration using the REST API.
// Falls back to a safe mock when no API key is provided.

export async function callGemini(systemPrompt, messages) {
  // Prefer a dedicated GENERATIVE_API_KEY env var for the REST API.
  const apiKey = process.env.GENERATIVE_API_KEY;

  // Mock when no key is present.
  if (!apiKey) {
    const last = messages[messages.length - 1]?.content || "";
    const reply = /under|below|less than|upto|up to|budget|lakh|lakhs|₹|rs/i.test(last)
      ? "Got it — what's your exact budget (in lakhs) and primary use: city or highway?"
      : "Thanks — is this your first car, and any fuel preference (petrol/diesel/CNG/EV)?";

    const mock = { reply, stage: "gathering", shortlist: [], verdict: null };
    return JSON.stringify(mock);
  }

  // Default model; allow override with env var.
  const defaultModel = "models/gemini-flash-latest";
  const model = process.env.GEMINI_MODEL || defaultModel;

  try {
    const contents = messages
      .filter((message) => message?.content)
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: String(message.content) }],
      }));

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1200,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      const notFound = res.status === 404 || res.status === 400;

      if (notFound) {
        return JSON.stringify({
          reply: `Model not found: ${model}. Please set a valid model name in GEMINI_MODEL or use a supported model like models/gemini-flash-latest. Also ensure your GENERATIVE_API_KEY has access to the model.`,
          stage: "gathering",
          shortlist: [],
          verdict: null,
        });
      }

      throw new Error(`Gemini request failed (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("") || JSON.stringify(data);

    return text;
  } catch (err) {
    console.error("Gemini client call failed:", err);

    return JSON.stringify({ reply: "Sorry, I couldn't reach the AI right now.", stage: "gathering", shortlist: [], verdict: null });
  }
}
