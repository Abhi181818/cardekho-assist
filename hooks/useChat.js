"use client";
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

        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (Array.isArray(data.shortlist)) setShortlist(data.shortlist);
        if (data.verdict !== undefined) setVerdict(data.verdict);
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
