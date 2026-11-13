"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Dice5, X } from "lucide-react";
import { CATEGORY_COLORS as categoryColors } from "@/lib/category-colors";
import { wikiImage } from "@/lib/wiki-image";


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
          className="fixed bottom-16 left-2 right-2 z-[1020] rounded-[4px] shadow-2xl overflow-hidden"
          style={{
            maxHeight: "65vh",
            backgroundColor: "var(--plate)",
            backdropFilter: "blur(20px)",
            color: "var(--parchment)",
            border: isDark
              ? "1px solid color-mix(in srgb, var(--parchment) 8%, transparent)"
              : "1px solid color-mix(in srgb, var(--parchment) 6%, transparent)",
            boxShadow: isDark
              ? "0 0 40px color-mix(in srgb, var(--cinnabar) 8%, transparent)"
              : "0 0 40px color-mix(in srgb, var(--parchment) 12%, transparent)",
            pointerEvents: "auto",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className={`text-xl font-bold ${"text-parchment"}`}>
              Random Events
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={randomizeEvents}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-sm font-medium transition-all ${isDark
                  ? "bg-cinnabar/15 text-cinnabar hover:bg-cinnabar/25"
                  : "bg-cinnabar/12 text-cinnabar hover:bg-cinnabar/12"
                  }`}
              >
                <Dice5 className="w-3.5 h-3.5" />
                Randomize
              </button>
              <button
                onClick={() => setIsSlider(false)}
                className={`w-8 h-8 rounded-[3px] flex items-center justify-center transition-colors ${isDark
                  ? "text-parchment/40 hover:text-parchment hover:bg-parchment/10"
                  : "text-dim hover:text-parchment hover:bg-ink/5"
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
                const catColor = categoryColors[event.category] || "var(--parchment-dim)";
                return (
                  <div
                    key={event._id}
                    onClick={() => {
                      onEventClick(event);
                      setIsSlider(false);
                    }}
                    className="snap-start flex-shrink-0 w-[260px] rounded-[3px] cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: isDark
                        ? "color-mix(in srgb, var(--parchment) 4%, transparent)"
                        : "color-mix(in srgb, var(--parchment) 2%, transparent)",
                      border: isDark
                        ? "1px solid color-mix(in srgb, var(--parchment) 6%, transparent)"
                        : "1px solid color-mix(in srgb, var(--parchment) 5%, transparent)",
                    }}
                  >
                    {/* Thumbnail */}
                    {event.thumbnail && (
                      <div className="h-28 w-full rounded-t-[3px] overflow-hidden">
                        <img
                          src={wikiImage(event.thumbnail)}
                          alt={event.title}
                          className="h-full w-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                      </div>
                    )}

                    <div className="p-3">
                      <h3 className={`text-sm font-medium line-clamp-2 ${"text-parchment"}`}>
                        {event.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-sm font-bold ${"text-cinnabar"}`}>
                          {event.year ?? "—"}
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