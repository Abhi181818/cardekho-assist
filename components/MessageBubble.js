export default function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div
        className={`
        max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed font-medium
        ${
          isUser
            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm shadow-md"
            : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 rounded-bl-sm"
        }
      `}
      >
        {content}
      </div>
    </div>
  );
}
