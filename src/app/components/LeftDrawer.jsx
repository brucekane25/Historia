"use client";
import { motion, AnimatePresence } from "framer-motion";
import EventTimeline from "./EventTimeline";
import { X, LineChart } from "lucide-react";

const LeftDrawer = ({
  isDesktop,
  leftOpen,
  setLeftOpen,
  events,
  onEventClick,
  lightMode,
}) => {
  const isDark = !lightMode;

  return (
    <AnimatePresence>
      {leftOpen && (
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed z-[1020] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{
            left: "15px",
            top: isDesktop ? "8vh" : "4vh",
            height: isDesktop ? "84vh" : "85vh",
            width: isDesktop ? "min(330px, 28vw)" : "min(290px, 85vw)",
            minWidth: isDesktop ? "300px" : "260px",
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
              : "0 0 40px rgba(0,0,0,0.1)",
            pointerEvents: "auto",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <LineChart className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
              <span className="text-lg font-semibold">Timeline</span>
            </div>
            <button
              onClick={() => setLeftOpen(false)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark
                ? "text-white/40 hover:text-white hover:bg-white/10"
                : "text-gray-400 hover:text-gray-900 hover:bg-black/5"
                }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <EventTimeline
              lightMode={lightMode}
              events={events}
              leftOpen={leftOpen}
              setLeftOpen={setLeftOpen}
              onEventClick={onEventClick}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeftDrawer;