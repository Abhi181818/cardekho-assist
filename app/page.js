"use client";
import ChatPanel from "@/components/ChatPanel";
import ShortlistPanel from "@/components/ShortlistPanel";
import { useChat } from "@/hooks/useChat";

export default function Home() {
  const chat = useChat();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <header className="border-b border-gray-100 px-6 py-4">
            <h1 className="text-lg font-semibold text-gray-900">CarDekho AI Advisor</h1>
            <p className="text-sm text-gray-500">Tell me what you need. I&apos;ll find your car.</p>
          </header>
          <ChatPanel messages={chat.messages} loading={chat.loading} error={chat.error} onSend={chat.sendMessage} />
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <ShortlistPanel shortlist={chat.shortlist} verdict={chat.verdict} stage={chat.stage} />
        </section>
      </div>
    </main>
  );
}
