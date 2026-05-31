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
          <p className="text-sm text-gray-500">{car.variant} · {car.fuel}</p>
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
