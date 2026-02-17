"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import RangeSlider from "./RangeSlider";
import RightSliders from "./RightSliders";
import CategoryDropdown from "./CategoryDropdown";
import { X, Filter, Sliders, BarChart3, HelpCircle } from "lucide-react";

export default function SettingsPanel({
  isDesktop,
  mode,
  country,
  selectedCategory,
  setSelectedCategory,
  setSelectedEvent,
  setYearRange,
  setsettings,
  setcountry,
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
  const isDark = !mode;

  const handleClearFilters = () => {
    setYearRange({ startYear: -3000, endYear: 2024 });
    setSelectedCategory([]);
    setcountry("");
  };

  return (
    <div
      className={`rounded-2xl shadow-2xl ${isDesktop ? "p-5" : "py-3 px-4 min-w-[97vw] overflow-scroll"
        } max-w-[550px] ${isDark ? "glass-dark" : "glass"}`}
      style={{
        color: isDark ? "#e5e7eb" : "#111827",
        border: isDark
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders
            className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"
              }`}
          />
          <h2 className="text-xl font-semibold">Tweaks</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearFilters}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${isDark
                ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                : "bg-black/5 text-gray-500 hover:bg-black/10 hover:text-gray-900"
              }`}
          >
            Clear Filters
          </button>
          <button
            onClick={() => setsettings(false)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark
                ? "text-white/40 hover:text-white hover:bg-white/10"
                : "text-gray-400 hover:text-gray-900 hover:bg-black/5"
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
          icon={<Filter className="w-3.5 h-3.5" />}
          label="Categories"
          isDark={isDark}
        >
          <CategoryDropdown
            onCategoryChange={setSelectedCategory}
            clr={setSelectedEvent}
            mode={mode}
            selectedCategories={selectedCategory}
            setSelectedCategories={setSelectedCategory}
          />
        </SettingsSection>

        {/* Year Range */}
        <SettingsSection
          icon={<BarChart3 className="w-3.5 h-3.5" />}
          label="Year Range"
          isDark={isDark}
        >
          <RangeSlider
            setSelectedEvent={setSelectedEvent}
            yearRange={yearRange}
            setYearRange={setYearRange}
            mode={mode}
          />
        </SettingsSection>

        {/* Data Controls */}
        <SettingsSection
          icon={<Sliders className="w-3.5 h-3.5" />}
          label="Data"
          isDark={isDark}
        >
          <RightSliders
            setLimit={setLimit}
            mode={mode}
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
            className={`w-full justify-start gap-2 h-9 text-xs font-normal ${isDark
                ? "text-white/40 hover:text-white hover:bg-white/5"
                : "text-gray-500 hover:text-gray-900 hover:bg-black/5"
              }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Replay Tutorial
          </Button>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ icon, label, isDark, children }) {
  return (
    <div
      className={`rounded-xl p-3 ${isDark ? "bg-white/[0.03]" : "bg-black/[0.02]"
        }`}
      style={{
        border: isDark
          ? "1px solid rgba(255,255,255,0.04)"
          : "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className={isDark ? "text-purple-400" : "text-purple-600"}>
          {icon}
        </span>
        <span
          className={`text-xs font-medium ${isDark ? "text-white/50" : "text-gray-400"
            }`}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
