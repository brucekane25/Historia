"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dice5, Sun, Moon, LineChart, Settings, Globe, Map, Bookmark, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function BottomAppBar({
  setIsSlider,
  isSlider,
  leftOpen,
  settingsOpen,
  setSettingsOpen,
  setLeftOpen,
  lightMode,
  setLightMode,
  viewMode,
  onViewChange,
  setBookmarksOpen,
  bookmarksOpen,
  onSurpriseMe,
}) {
  const isDark = !lightMode;

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[1000]"
    >
      <div className="plate rounded-[3px] flex items-center gap-0.5 px-2 py-1.5">
        {/* Timeline */}
        <BottomBarBtn
          isDark={isDark}
          onClick={() => setLeftOpen(!leftOpen)}
          title="Timeline"
          active={leftOpen}
        >
          <LineChart className="w-4 h-4" strokeWidth={1.5} />
        </BottomBarBtn>

        {/* View Toggle */}
        <BottomBarBtn
          isDark={isDark}
          onClick={() => onViewChange(viewMode === "map" ? "globe" : "map")}
          title={viewMode === "map" ? "Globe View" : "Map View"}
        >
          {viewMode === "map" ? (
            <Globe className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <Map className="w-4 h-4" strokeWidth={1.5} />
          )}
        </BottomBarBtn>

        <Divider />

        {/* Random Events — the surveyor's seal, centre of the bar */}
        <button
          onClick={() => setIsSlider(!isSlider)}
          className={`mx-1 w-10 h-10 rounded-[2px] flex items-center justify-center transition-colors duration-200 ${
            isSlider
              ? "bg-cinnabar text-[color:var(--primary-foreground)]"
              : "bg-cinnabar/12 text-cinnabar hover:bg-cinnabar/22"
          }`}
          title="Random Events"
        >
          <Dice5 className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <Divider />

        {/* Dark Mode */}
        <BottomBarBtn
          isDark={isDark}
          onClick={() => setLightMode(!lightMode)}
          title={lightMode ? "Dark Mode" : "Light Mode"}
        >
          {lightMode ? (
            <Moon className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <Sun className="w-4 h-4" strokeWidth={1.5} />
          )}
        </BottomBarBtn>

        {/* Bookmarks */}
        <BottomBarBtn
          isDark={isDark}
          onClick={() => setBookmarksOpen(true)}
          title="Bookmarks"
          active={bookmarksOpen}
        >
          <Bookmark className="w-4 h-4" strokeWidth={1.5} />
        </BottomBarBtn>

        {/* Surprise Me */}
        <BottomBarBtn
          isDark={isDark}
          onClick={onSurpriseMe}
          title="Surprise Me"
        >
          <Sparkles className="w-4 h-4" strokeWidth={1.5} />
        </BottomBarBtn>

        <Divider />

        {/* Settings */}
        <BottomBarBtn
          isDark={isDark}
          onClick={() => setSettingsOpen(!settingsOpen)}
          title="Tweaks"
          active={settingsOpen}
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} />
        </BottomBarBtn>
      </div>
    </motion.div>
  );
}

function Divider() {
  return <span className="mx-1 w-px h-6 bg-hairline" aria-hidden="true" />;
}

function BottomBarBtn({ isDark, onClick, title, active = false, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`w-9 h-9 rounded-[2px] flex items-center justify-center transition-colors duration-200 ${
        active
          ? "bg-cinnabar/12 text-cinnabar"
          : "text-dim hover:text-parchment hover:bg-parchment/6"
      }`}
    >
      {children}
    </button>
  );
}
