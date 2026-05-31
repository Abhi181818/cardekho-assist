import { useState } from "react";

export default function CarCard({ car, isTopPick }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`
      rounded-2xl border overflow-hidden transition-all hover:shadow-lg
      ${
        isTopPick
          ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 shadow-md"
          : "border-gray-200 bg-white shadow-sm hover:shadow-md"
      }
    `}
    >
      {/* Top Pick Badge */}
      {isTopPick && (
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 text-white text-sm font-semibold flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <span>Recommended for You</span>
        </div>
      )}

      {/* Car Image Container */}
      <div className={`relative w-full h-48 bg-gradient-to-b from-gray-100 to-gray-50 overflow-hidden flex items-center justify-center ${isTopPick ? "border-b-2 border-emerald-200" : "border-b border-gray-100"}`}>
        {car.image ? (
          <img
            src={car.image}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">🚗</div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Header with Title and Price */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 leading-tight">
              {car.make} {car.model}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              {car.variant} · {car.year}
            </p>
          </div>
          <div className="text-right ml-3">
            <p className="font-bold text-xl text-blue-600">₹{car.price_lakh}L</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{car.mileage_kmpl} km/l</p>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-gray-100">
          <div className="text-center">
            <div className="text-lg mb-1">🛡️</div>
            <p className="text-xs font-semibold text-gray-900">{car.safety_rating}/5</p>
            <p className="text-xs text-gray-500">Safety</p>
          </div>
          <div className="text-center">
            <div className="text-lg mb-1">👥</div>
            <p className="text-xs font-semibold text-gray-900">{car.seating}</p>
            <p className="text-xs text-gray-500">Seats</p>
          </div>
          <div className="text-center">
            <div className="text-lg mb-1">⛽</div>
            <p className="text-xs font-semibold text-gray-900">{car.fuel}</p>
            <p className="text-xs text-gray-500">Fuel</p>
          </div>
        </div>

        {/* Description */}
        {car.reason && (
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">{car.reason}</p>
        )}

        {/* Expandable Details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`mt-3 w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            expanded
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <span>{expanded ? "Hide" : "Show"} Details</span>
          <span className="text-lg">{expanded ? "↑" : "↓"}</span>
        </button>

        {expanded && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-semibold text-amber-900 mb-1">⚠️ Trade-offs:</p>
            <p className="text-xs text-amber-800">{car.tradeoff}</p>
          </div>
        )}
      </div>
    </div>
  );
}
