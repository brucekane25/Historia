"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import RangeSlider from "./RangeSlider";
import RightSliders from "./RightSliders";
import CategoryDropdown from "./CategoryDropdown";
import { X, Filter, Sliders, BarChart3, HelpCircle, RotateCcw } from "lucide-react";
import { FULL_YEAR_RANGE } from "@/lib/history-range";

import { motion, useDragControls } from "framer-motion";

export default function SettingsPanel({
  isDesktop,
  lightMode,
  selectedCategory,
  setSelectedCategory,
  setSelectedEvent,
  setYearRange,
  setSettingsOpen,
  yearRange,
  pages,
  currentPage,
  setCurrentPage,
  setLimit,
  limit,
  filterTotalEvents,
  totalEvents,
  isLoading,
  onShowTutorial,
}) {
  const isDark = !lightMode;
  const controls = useDragControls();

  const handleClearFilters = () => {
    setYearRange({ ...FULL_YEAR_RANGE });
    setSelectedCategory([]);
    setSelectedEvent(null);
    setCurrentPage(1);
  };

  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      whileDrag={{ scale: 1.02 }}
      className={`rounded-[4px] shadow-2xl w-full ${isDesktop ? "p-5" : "p-4"
        }`}
      style={{
        backgroundColor: "var(--plate)",
        backdropFilter: "blur(24px)",
        color: "var(--parchment)",
        border: isDark
          ? "1px solid color-mix(in srgb, var(--cinnabar) 20%, transparent)"
          : "1px solid color-mix(in srgb, var(--cinnabar) 15%, transparent)",
        boxShadow: isDark
          ? "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px color-mix(in srgb, var(--cinnabar) 10%, transparent)"
          : "0 25px 50px -12px color-mix(in srgb, var(--parchment) 15%, transparent), 0 0 30px color-mix(in srgb, var(--cinnabar) 10%, transparent)",
        maxHeight: "calc(100vh - 180px)",
        overflow: "auto",
      }}
    >
      {/* Gradient border top */}
      <div className="relative h-1 -mx-5 -mt-5 mb-4 rounded-t-[3px] overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, var(--cinnabar) 0%, color-mix(in srgb, var(--brass) 55%, transparent) 55%, transparent 100%)",
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s linear infinite',
          }}
        />
      </div>

      {/* Header */}
      <header
        className="flex items-center justify-between mb-4 cursor-move"
        onPointerDown={(e) => controls.start(e)}
      >
        <div className="flex items-center gap-2.5 pointer-events-none">
          <Sliders className="w-5 h-5 text-cinnabar" />
          <h2 className="display text-lg font-medium">Tweaks</h2>
        </div>
        <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={handleClearFilters}
            className={`flex items-center gap-1.5 text-[11px] px-3 py-2 rounded-[3px] eyebrow transition-all hover:scale-105 border ${isDark
              ? "border-hairline text-parchment/65 hover:text-parchment hover:bg-parchment/5"
              : "border-hairline text-parchment/70 hover:bg-ink/5"
              }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={() => setSettingsOpen(false)}
            className={`w-8 h-8 rounded-[3px] flex items-center justify-center transition-all hover:scale-110 hover:bg-parchment/10 ${isDark
              ? "text-parchment/40 hover:text-parchment"
              : "text-dim hover:text-parchment"
              }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Sections */}
      <div className="space-y-3">
        {/* Category Filter */}
        <SettingsSection
          icon={<Filter className="w-4 h-4" />}
          label="Categories"
          isDark={isDark}
          color="#d9553a"
        >
          <CategoryDropdown
            lightMode={lightMode}
            selectedCategories={selectedCategory}
            setSelectedCategories={setSelectedCategory}
          />
          <p
            className={`mt-2 text-[10px] leading-relaxed ${
              isDark ? "text-parchment/30" : "text-dim"
            }`}
          >
            Curated, Holidays, Births and Deaths search the whole archive. Topic and
            generic event filters apply to the events currently loaded.
          </p>
        </SettingsSection>

        {/* Year Range */}
        <SettingsSection
          icon={<BarChart3 className="w-4 h-4" />}
          label="Year Range"
          isDark={isDark}
          color="#4f9c8a"
        >
          <RangeSlider
            setSelectedEvent={setSelectedEvent}
            yearRange={yearRange}
            setYearRange={setYearRange}
            lightMode={lightMode}
          />
        </SettingsSection>

        {/* Data Controls */}
        <SettingsSection
          icon={<Sliders className="w-4 h-4" />}
          label="Data"
          isDark={isDark}
          color="#4f9c8a"
        >
          <RightSliders
            setLimit={setLimit}
            lightMode={lightMode}
            pages={pages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={limit}
            filterTotalEvents={filterTotalEvents}
            totalEvents={totalEvents}
            isLoading={isLoading}
          />
        </SettingsSection>

        {/* Help & Tutorial */}
        <div className="pt-2">
          <Button
            variant="ghost"
            onClick={onShowTutorial}
            className={`w-full justify-start gap-2.5 h-11 text-sm font-medium rounded-[3px] transition-all hover:scale-[1.02] ${isDark
              ? "text-parchment/50 hover:text-parchment hover:bg-parchment/5"
              : "text-dim hover:text-parchment hover:bg-ink/5"
              }`}
          >
            <HelpCircle className="w-4 h-4" />
            Replay Tutorial
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function SettingsSection({ icon, label, isDark, color, children }) {
  return (
    <div
      className={`rounded-[3px] p-4 transition-all ${isDark ? "bg-plate/[0.03] hover:bg-plate/[0.05]" : "bg-ink/[0.02] hover:bg-ink/[0.04]"
        }`}
      style={{
        border: "1px solid color-mix(in srgb, var(--parchment) 5%, transparent)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div 
          className="w-8 h-8 rounded-[3px] flex items-center justify-center"
          style={{ 
            backgroundColor: `${color}20`,
            color: color 
          }}
        >
          {icon}
        </div>
        <span className="display text-[15px] font-medium tracking-tight">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
