"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import RangeSlider from "./RangeSlider";
import RightSliders from "./RightSliders";
import CategoryDropdown from "./CategoryDropdown";
import { X, Filter, Sliders, BarChart3, HelpCircle, Sparkles, RotateCcw } from "lucide-react";

import { motion, useDragControls } from "framer-motion";

export default function SettingsPanel({
  isDesktop,
  lightMode,
  country,
  selectedCategory,
  setSelectedCategory,
  setSelectedEvent,
  setYearRange,
  setSettingsOpen,
  setCountry,
  yearRange,
  pages,
  currentPage,
  setCurrentPage,
  setLimit,
  limit,
  filterTotalEvents,
  totalEvents,
  onShowTutorial,
}) {
  const isDark = !lightMode;
  const controls = useDragControls();

  const handleClearFilters = () => {
    setYearRange({ startYear: -3000, endYear: 2024 });
    setSelectedCategory([]);
    setCountry("");
  };

  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      whileDrag={{ scale: 1.02 }}
      className={`rounded-2xl shadow-2xl w-full ${isDesktop ? "p-5" : "p-4"
        }`}
      style={{
        backgroundColor: isDark
          ? "rgba(15,17,30,0.95)"
          : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(24px)",
        color: isDark ? "#e5e7eb" : "#111827",
        border: isDark
          ? "1px solid rgba(139,92,246,0.2)"
          : "1px solid rgba(139,92,246,0.15)",
        boxShadow: isDark
          ? "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.1)"
          : "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 30px rgba(139,92,246,0.1)",
        maxHeight: "calc(100vh - 180px)",
        overflow: "auto",
      }}
    >
      {/* Gradient border top */}
      <div className="relative h-1 -mx-5 -mt-5 mb-4 rounded-t-2xl overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, #8b5cf6, #06b6d4, #8b5cf6)",
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
          <div className="relative">
            <Sliders
              className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"
                }`}
            />
            <Sparkles className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${isDark ? "text-cyan-400" : "text-cyan-500"} animate-pulse`} />
          </div>
          <h2 className="text-lg font-bold">Tweaks</h2>
        </div>
        <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={handleClearFilters}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all hover:scale-105 ${isDark
              ? "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
              : "bg-cyan-50 text-cyan-600 hover:bg-cyan-100"
              }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={() => setSettingsOpen(false)}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:bg-white/10 ${isDark
              ? "text-white/40 hover:text-white"
              : "text-gray-400 hover:text-gray-900"
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
          color="#8b5cf6"
        >
          <CategoryDropdown
            onCategoryChange={setSelectedCategory}
            clr={setSelectedEvent}
            lightMode={lightMode}
            selectedCategories={selectedCategory}
            setSelectedCategories={setSelectedCategory}
          />
        </SettingsSection>

        {/* Year Range */}
        <SettingsSection
          icon={<BarChart3 className="w-4 h-4" />}
          label="Year Range"
          isDark={isDark}
          color="#06b6d4"
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
          color="#10b981"
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
          />
        </SettingsSection>

        {/* Help & Tutorial */}
        <div className="pt-2">
          <Button
            variant="ghost"
            onClick={onShowTutorial}
            className={`w-full justify-start gap-2.5 h-11 text-sm font-medium rounded-xl transition-all hover:scale-[1.02] ${isDark
              ? "text-white/50 hover:text-white hover:bg-white/5"
              : "text-gray-500 hover:text-gray-900 hover:bg-black/5"
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
      className={`rounded-xl p-4 transition-all ${isDark ? "bg-white/[0.03] hover:bg-white/[0.05]" : "bg-black/[0.02] hover:bg-black/[0.04]"
        }`}
      style={{
        border: isDark
          ? "1px solid rgba(255,255,255,0.05)"
          : "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ 
            backgroundColor: `${color}20`,
            color: color 
          }}
        >
          {icon}
        </div>
        <span
          className={`text-sm font-semibold ${isDark ? "text-white/80" : "text-gray-700"
            }`}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
