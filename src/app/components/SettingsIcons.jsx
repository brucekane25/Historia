"use client";
import React, { useState } from "react";
import { 
  Settings, Sun, Moon, Dice5, Sparkles, LineChart, 
  BarChart3, Bookmark, Command
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SettingsIcons = ({
  setLeftOpen,
  leftOpen,
  setLightMode,
  lightMode,
  setIsOpen,
  isOpen,
  setSettingsOpen,
  settingsOpen,
  setStatsOpen,
  statsOpen,
  setBookmarksOpen,
  setCommandPaletteOpen,
  onSurpriseMe,
}) => {
  const isDark = !lightMode;
  const [isExpanded, setIsExpanded] = useState(false);

  const buttons = [
    {
      icon: <LineChart className="w-5 h-5" />,
      label: "Timeline",
      active: leftOpen,
      onClick: () => setLeftOpen(!leftOpen),
      color: "#8b5cf6",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: "Stats",
      active: statsOpen,
      onClick: () => setStatsOpen(!statsOpen),
      color: "#06b6d4",
    },
    {
      icon: <Bookmark className="w-5 h-5" />,
      label: "Saved",
      onClick: () => setBookmarksOpen(true),
      color: "#f59e0b",
    },
    {
      icon: <Dice5 className="w-5 h-5" />,
      label: "Random",
      onClick: () => setIsOpen(!isOpen),
      color: "#ec4899",
    },
    {
      icon: <Settings className="w-5 h-5" />,
      label: "Tweaks",
      active: settingsOpen,
      onClick: () => setSettingsOpen(!settingsOpen),
      color: "#10b981",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1025]"
    >
      <motion.div
        className={`flex items-center gap-1 px-2 py-2 rounded-2xl transition-all duration-300 ${
          isExpanded ? 'gap-2' : 'gap-1'
        }`}
        style={{
          backgroundColor: isDark ? "rgba(15,17,30,0.85)" : "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          border: isDark 
            ? "1px solid rgba(139,92,246,0.2)" 
            : "1px solid rgba(139,92,246,0.15)",
          boxShadow: isDark 
            ? "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.1) inset"
            : "0 8px 32px rgba(139,92,246,0.15)",
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Main buttons */}
        {buttons.map((btn, i) => (
          <motion.button
            key={btn.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={btn.onClick}
            className={`group relative p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
              btn.active 
                ? isDark 
                  ? "bg-white/10 text-white" 
                  : "bg-black/10 text-gray-900"
                : isDark
                  ? "text-white/50 hover:text-white hover:bg-white/10"
                  : "text-gray-500 hover:text-gray-900 hover:bg-black/10"
            }`}
            style={{
              border: btn.active 
                ? `1px solid ${btn.color}50`
                : 'none',
              boxShadow: btn.active 
                ? `0 0 16px ${btn.color}30`
                : 'none',
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {btn.icon}
            
            {/* Active indicator */}
            {btn.active && (
              <div 
                className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                style={{ backgroundColor: btn.color }}
              />
            )}
            
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                backgroundColor: isDark ? "rgba(15,17,30,0.95)" : "rgba(255,255,255,0.95)",
                color: isDark ? "#e5e7eb" : "#111827",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {btn.label}
            </div>
          </motion.button>
        ))}

        {/* Divider */}
        <div 
          className="w-px h-8 mx-1"
          style={{
            background: isDark 
              ? "linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent)"
              : "linear-gradient(180deg, transparent, rgba(0,0,0,0.1), transparent)",
          }}
        />

        {/* Light/Dark toggle */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          onClick={() => setLightMode(!lightMode)}
          className="group relative p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 text-white/50 hover:text-white hover:bg-white/10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {lightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              backgroundColor: isDark ? "rgba(15,17,30,0.95)" : "rgba(255,255,255,0.95)",
              color: isDark ? "#e5e7eb" : "#111827",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {lightMode ? 'Dark' : 'Light'}
          </div>
        </motion.button>

        {/* Divider */}
        <div 
          className="w-px h-8 mx-1"
          style={{
            background: isDark 
              ? "linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent)"
              : "linear-gradient(180deg, transparent, rgba(0,0,0,0.1), transparent)",
          }}
        />

        {/* Command Palette */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setCommandPaletteOpen(true)}
          className="group relative p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 text-white/50 hover:text-white hover:bg-white/10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Command className="w-5 h-5" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              backgroundColor: isDark ? "rgba(15,17,30,0.95)" : "rgba(255,255,255,0.95)",
              color: isDark ? "#e5e7eb" : "#111827",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            ⌘K
          </div>
        </motion.button>

        {/* Surprise Me */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          onClick={onSurpriseMe}
          className="group relative p-2.5 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{
            background: isDark 
              ? "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))"
              : "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))",
            color: isDark ? "#c084fc" : "#a855f7",
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles className="w-5 h-5" />
          
          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              backgroundColor: isDark ? "rgba(15,17,30,0.95)" : "rgba(255,255,255,0.95)",
              color: isDark ? "#e5e7eb" : "#111827",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            Surprise!
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default SettingsIcons;
