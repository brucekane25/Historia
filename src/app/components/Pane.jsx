"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Dice5, X, Sparkles } from "lucide-react";

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

const Pane = ({
  isOpen,
  setIsOpen,
  lightMode,
  events,
  randomEvents,
  randomizeEvents,
  onEventClick,
}) => {
  const isDark = !lightMode;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1015]"
          style={{ pointerEvents: "none" }}
        >
          {/* Click outside to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
            style={{ pointerEvents: "auto" }}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-4 top-20 bottom-20 flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: "340px",
              maxWidth: "calc(100vw - 32px)",
              backgroundColor: isDark
                ? "rgba(15,17,30,0.92)"
                : "rgba(255,255,255,0.92)",
              backdropFilter: "blur(24px)",
              color: isDark ? "#e5e7eb" : "#111827",
              border: isDark
                ? "1px solid rgba(139,92,246,0.2)"
                : "1px solid rgba(139,92,246,0.15)",
              boxShadow: isDark
                ? "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.1)"
                : "0 25px 50px -12px rgba(0,0,0,0.1), 0 0 30px rgba(139,92,246,0.08)",
              pointerEvents: "auto",
            }}
          >
            {/* Gradient border */}
            <div className="relative h-1 flex-shrink-0">
              <div 
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, #8b5cf6, #ec4899, #8b5cf6)",
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite',
                }}
              />
            </div>
          
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${isDark ? "text-pink-400" : "text-pink-600"}`} />
                <span className="text-lg font-bold">Random Events</span>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={randomizeEvents}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 ${isDark
                    ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                    : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                    }`}
                >
                  <Dice5 className="w-3.5 h-3.5" />
                  Shuffle
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105 ${isDark
                    ? "text-white/40 hover:text-white hover:bg-white/10"
                    : "text-gray-400 hover:text-gray-900 hover:bg-black/5"
                    }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-4 pb-4 overflow-y-auto flex-1">
              <ul className="space-y-3">
                {randomEvents.map((event) => {
                  const catColor = categoryColors[event.category] || "#6b7280";
                  return (
                    <li
                      key={event._id}
                      className="rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-lg"
                      style={{
                        background: isDark
                          ? "rgba(255,255,255,0.04)"
                          : "rgba(0,0,0,0.02)",
                        border: isDark
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "1px solid rgba(0,0,0,0.05)",
                      }}
                      onClick={() => {
                        onEventClick(event);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div
                          className={`h-14 w-14 rounded-lg flex-shrink-0 overflow-hidden ${!event.thumbnail
                            ? isDark ? "bg-white/5" : "bg-gray-100"
                            : ""
                            }`}
                        >
                          {event.thumbnail && (
                            <img
                              src={event.thumbnail}
                              alt={event.title}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex-grow min-w-0">
                          <h3 className={`text-sm font-semibold line-clamp-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-bold ${isDark ? "text-purple-400" : "text-purple-600"}`}>
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
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Pane;
