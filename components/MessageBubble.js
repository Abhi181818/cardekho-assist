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
