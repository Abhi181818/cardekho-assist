import CarCard from "./CarCard";

export default function ShortlistPanel({ shortlist, verdict, stage }) {
  if (stage === "gathering" || !shortlist || shortlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-10">
        <div className="text-5xl mb-4">🚗</div>
        <h2 className="text-lg font-semibold text-gray-700">Your shortlist will appear here</h2>
        <p className="text-sm text-gray-400 mt-2">Answer a few questions on the left and I'll find your best matches.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">Your Shortlist ({shortlist.length} cars)</h2>
      <div className="space-y-4">
        {shortlist.map((car) => (
          <CarCard key={car.id} car={car} isTopPick={car.id === verdict} />
        ))}
      </div>
    </div>
  );
}
