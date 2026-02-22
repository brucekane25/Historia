"use client";
import React, { useEffect, useState } from "react";
import { Settings, Sun, Moon, Dice5, LineChart, Wrench, BarChart3, Bookmark, Command } from "lucide-react";
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
  setBookmarksOpen,
  setCommandPaletteOpen,
}) => {
  const isDark = !lightMode;
  const [panel, setPanel] = useState(false);

  const buttons = [
    {
      icon: <LineChart className="w-4 h-4" />,
      label: "Timeline",
      onClick: () => setLeftOpen(!leftOpen),
    },
    {
      icon: <BarChart3 className="w-4 h-4" />,
      label: "Stats",
      onClick: () => setStatsOpen(true),
    },
    {
      icon: lightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      label: lightMode ? "Light" : "Dark",
      onClick: () => setLightMode(!lightMode),
    },
    {
      icon: <Dice5 className="w-4 h-4" />,
      label: "Random",
      onClick: () => setIsOpen(!isOpen),
    },
    {
      icon: <Settings className="w-4 h-4" />,
      label: "Tweaks",
      onClick: () => setSettingsOpen(!settingsOpen),
    },
    {
      icon: <Bookmark className="w-4 h-4" />,
      label: "Bookmarks",
      onClick: () => setBookmarksOpen(true),
    },
    {
      icon: <Command className="w-4 h-4" />,
      label: "⌘K",
      onClick: () => setCommandPaletteOpen(true),
    },
  ];

  return (
    <>
      <AnimatePresence>
        {panel && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute flex flex-col items-end gap-2 bottom-[18%] right-5 z-[1010]"
          >
            {buttons.map((btn, i) => (
              <motion.div
                key={btn.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
              >
                <FloatingBtn isDark={isDark} onClick={btn.onClick}>
                  {btn.icon}
                  <span className="text-xs font-medium">{btn.label}</span>
                </FloatingBtn>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-[8%] right-5 z-[1010]">
        <FloatingBtn isDark={isDark} onClick={() => setPanel(!panel)}>
          <Wrench className="w-4 h-4" />
          <span className="text-xs font-medium">Settings</span>
        </FloatingBtn>
      </div>
    </>
  );
};

export default SettingsIcons;

function FloatingBtn({ isDark, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl transition-all duration-200 cursor-pointer ${isDark
        ? "glass-dark text-white/80 hover:text-white hover:scale-105 shadow-purple-500/5"
        : "glass text-gray-700 hover:text-gray-900 hover:scale-105 shadow-black/5"
        }`}
      style={{
        border: isDark
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </button>
  );
}
