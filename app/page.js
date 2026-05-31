"use client";
import ChatPanel from "@/components/ChatPanel";
import ShortlistPanel from "@/components/ShortlistPanel";
import { useChat } from "@/hooks/useChat";

export default function Home() {
  const chat = useChat();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚗 CarDekho AI Advisor</h1>
          <p className="text-lg text-gray-600">Find your perfect car with AI-powered recommendations</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Chat Panel - Left Column (spans 1 column on lg) */}
          <section className="lg:col-span-1 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <header className="border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-blue-50 to-blue-100">
              <h2 className="text-lg font-bold text-gray-900">Chat with Advisor</h2>
              <p className="text-sm text-gray-600 mt-1">Tell me what you need. I&apos;ll find your car.</p>
            </header>
            <ChatPanel messages={chat.messages} loading={chat.loading} error={chat.error} onSend={chat.sendMessage} />
          </section>

          {/* Shortlist Panel - Right Column (spans 2 columns on lg) */}
          <section className="lg:col-span-2 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
            <ShortlistPanel shortlist={chat.shortlist} verdict={chat.verdict} stage={chat.stage} />
          </section>
        </div>
      </div>
    </main>
  );
}
