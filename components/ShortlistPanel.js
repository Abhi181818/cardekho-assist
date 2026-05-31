import CarCard from "./CarCard";

export default function ShortlistPanel({ shortlist, verdict, stage }) {
  if (stage === "gathering" || !shortlist || shortlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center px-10">
        <div className="text-8xl mb-6 opacity-80">🚗</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Shortlist Will Appear Here</h2>
        <p className="text-gray-600 mb-6 max-w-md">Answer a few questions in the chat and I&apos;ll analyze your preferences to find the perfect car matches.</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
          <span className="animate-spin">⏳</span>
          <span>Waiting for your input...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-5 bg-gradient-to-r from-amber-50 to-orange-50">
        <h2 className="text-lg font-bold text-gray-900 mb-1">
          Your Shortlist <span className="text-2xl font-bold text-blue-600">({shortlist.length})</span>
        </h2>
        <p className="text-sm text-gray-600">Top recommendations based on your preferences</p>
      </div>

      {/* Shortlist Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-5">
          {shortlist.map((car, index) => (
            <div key={car.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CarCard car={car} isTopPick={car.id === verdict} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
