"use client";
import { motion, AnimatePresence } from "framer-motion";
import EventTimeline from "./EventTimeline";
import { X, LineChart, Sparkles } from "lucide-react";

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1015]"
          style={{ pointerEvents: "none" }}
        >
          {/* Click outside to close overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={() => setLeftOpen(false)}
            style={{ pointerEvents: "auto" }}
          />
          
          {/* Drawer panel */}
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-4 top-4 bottom-4 flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: isDesktop ? "min(330px, 28vw)" : "calc(100vw - 32px)",
              maxWidth: "340px",
              minWidth: "280px",
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
            {/* Animated gradient border top */}
            <div className="relative h-1 flex-shrink-0">
              <div 
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(90deg, #8b5cf6, #a78bfa, #8b5cf6)",
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite',
                }}
              />
            </div>
          
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <LineChart className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                  <Sparkles className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${isDark ? "text-purple-300" : "text-purple-500"} animate-pulse`} />
                </div>
                <span className="text-lg font-bold">Timeline</span>
              </div>
              <button
                onClick={() => setLeftOpen(false)}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isDark
                  ? "text-white/40 hover:text-white hover:bg-white/10 hover:scale-105"
                  : "text-gray-400 hover:text-gray-900 hover:bg-black/5 hover:scale-105"
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeftDrawer;