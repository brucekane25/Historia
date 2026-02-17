"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dice5, Sun, Moon, LineChart, Settings, Globe, Map } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomAppBar({
  setIsSlider,
  isSlider,
  isLeftOpen,
  settings,
  setsettings,
  setisLeftOpen,
  mode,
  setmode,
  viewMode,
  setViewMode,
}) {
  const isDark = !mode;

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[999]"
    >
      <div
        className={`flex items-center gap-1 px-3 py-2 rounded-2xl shadow-2xl ${isDark
            ? "glass-dark shadow-purple-500/5"
            : "glass shadow-black/10"
          }`}
        style={{
          border: isDark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Timeline */}
        <BottomBarBtn
          isDark={isDark}
          onClick={() => setisLeftOpen(!isLeftOpen)}
          title="Timeline"
        >
          <LineChart className="w-4 h-4" />
        </BottomBarBtn>

        {/* View Toggle */}
        <BottomBarBtn
          isDark={isDark}
          onClick={() => setViewMode(viewMode === "map" ? "globe" : "map")}
          title={viewMode === "map" ? "Globe View" : "Map View"}
        >
          {viewMode === "map" ? (
            <Globe className="w-4 h-4" />
          ) : (
            <Map className="w-4 h-4" />
          )}
        </BottomBarBtn>

        {/* Random Events - center hero button */}
        <button
          onClick={() => setIsSlider(!isSlider)}
          className={`mx-1 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isDark
              ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 shadow-lg shadow-purple-500/10"
              : "bg-purple-100 text-purple-600 hover:bg-purple-200 shadow-lg shadow-purple-500/10"
            }`}
          title="Random Events"
        >
          <Dice5 className="w-5 h-5" />
        </button>

        {/* Dark Mode */}
        <BottomBarBtn
          isDark={isDark}
          onClick={() => setmode(!mode)}
          title={mode ? "Dark Mode" : "Light Mode"}
        >
          {mode ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </BottomBarBtn>

        {/* Settings */}
        <BottomBarBtn
          isDark={isDark}
          onClick={() => setsettings(!settings)}
          title="Tweaks"
        >
          <Settings className="w-4 h-4" />
        </BottomBarBtn>
      </div>
    </motion.div>
  );
}

function BottomBarBtn({ isDark, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${isDark
          ? "text-white/60 hover:text-white hover:bg-white/10"
          : "text-gray-600 hover:text-gray-900 hover:bg-black/5"
        }`}
    >
      {children}
    </button>
  );
}