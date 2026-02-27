"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Dice5, X } from "lucide-react";

const categoryColors = {
  war: "#ef4444",
  political: "#8b5cf6",
  cultural: "#f59e0b",
  scientific: "#10b981",
  religious: "#eab308",
  disasters: "#f97316",
  discoveries: "#3b82f6",
  historical: "#ec4899",
  economic: "#14b8a6",
  social: "#f43f5e",
  births: "#a78bfa",
  deaths: "#6b7280",
  events: "#22d3ee",
  environmental: "#22c55e",
};

const AlternativeDrawer = ({
  isSlider,
  setIsSlider,
  events,
  randomizeEvents,
  onEventClick,
  lightMode,
}) => {
  const isDark = !lightMode;

  return (
    <AnimatePresence>
      {isSlider && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-16 left-2 right-2 z-[1020] rounded-2xl shadow-2xl overflow-hidden"
          style={{
            maxHeight: "65vh",
            backgroundColor: isDark
              ? "rgba(15,17,30,0.95)"
              : "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            color: isDark ? "#e5e7eb" : "#111827",
            border: isDark
              ? "1px solid rgba(255,255,255,0.08)"
              : "1px solid rgba(0,0,0,0.06)",
            boxShadow: isDark
              ? "0 0 40px rgba(99,102,241,0.08)"
              : "0 0 40px rgba(0,0,0,0.12)",
            pointerEvents: "auto",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Random Events
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={randomizeEvents}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isDark
                  ? "bg-purple-500/15 text-purple-300 hover:bg-purple-500/25"
                  : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                  }`}
              >
                <Dice5 className="w-3.5 h-3.5" />
                Randomize
              </button>
              <button
                onClick={() => setIsSlider(false)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark
                  ? "text-white/40 hover:text-white hover:bg-white/10"
                  : "text-gray-400 hover:text-gray-900 hover:bg-black/5"
                  }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal scroll cards */}
          <div className="px-3 pb-4">
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth">
              {events.map((event) => {
                const catColor = categoryColors[event.category] || "#6b7280";
                return (
                  <div
                    key={event._id}
                    onClick={() => {
                      onEventClick(event);
                      setIsSlider(false);
                    }}
                    className="snap-start flex-shrink-0 w-[260px] rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.02)",
                      border: isDark
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* Thumbnail */}
                    {event.thumbnail && (
                      <div className="h-28 w-full rounded-t-xl overflow-hidden">
                        <img
                          src={event.thumbnail}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-3">
                      <h3 className={`text-sm font-medium line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {event.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-sm font-bold ${isDark ? "text-purple-400" : "text-purple-600"}`}>
                          {event.year}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize"
                          style={{
                            backgroundColor: catColor + "20",
                            color: catColor,
                          }}
                        >
                          {event.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlternativeDrawer;