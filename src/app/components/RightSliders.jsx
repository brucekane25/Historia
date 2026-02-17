"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

const RightSliders = ({
  pages,
  mode,
  currentPage,
  setCurrentPage,
  setLimit,
  limit,
  filterTotalEvents,
  totalEvents,
}) => {
  const isDark = !mode;
  const [sliderValue, setSliderValue] = useState(limit);

  const handleSliderChange = (value) => {
    setSliderValue(value[0]);
  };

  const handleInputChange = (e) => {
    setSliderValue(e.target.value === "" ? "" : Number(e.target.value));
  };

  const handleSliderChangeCommitted = () => {
    if (!Number.isNaN(sliderValue) && sliderValue >= 1 && sliderValue <= 10000) {
      setLimit(sliderValue);
    } else {
      setSliderValue(limit);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Events Per Page */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>
            Events per page
          </span>
          <Input
            value={sliderValue}
            onChange={handleInputChange}
            onBlur={handleSliderChangeCommitted}
            onKeyDown={(e) => e.key === "Enter" && handleSliderChangeCommitted()}
            type="number"
            min={1}
            max={10000}
            step={1}
            className={`w-20 text-center text-sm font-mono rounded-lg border ${isDark
                ? "bg-white/5 border-white/10 text-white focus:border-purple-500/50"
                : "bg-black/5 border-black/10 text-gray-900 focus:border-purple-500"
              }`}
          />
        </div>
        <Slider
          value={[sliderValue]}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderChangeCommitted}
          min={1}
          max={10000}
          step={1}
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className={`rounded-lg ${isDark
              ? "border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-30"
              : "border-black/10 text-gray-700 hover:bg-black/5 disabled:opacity-30"
            }`}
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          Prev
        </Button>
        <span className={`text-xs font-mono ${isDark ? "text-white/60" : "text-gray-500"}`}>
          {currentPage}/{pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === pages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className={`rounded-lg ${isDark
              ? "border-white/10 text-white/70 hover:bg-white/10 disabled:opacity-30"
              : "border-black/10 text-gray-700 hover:bg-black/5 disabled:opacity-30"
            }`}
        >
          Next
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <span className={isDark ? "text-white/30" : "text-gray-400"}>
          Total: <strong className={isDark ? "text-white/60" : "text-gray-600"}>{totalEvents?.toLocaleString()}</strong>
        </span>
        <span className={isDark ? "text-white/30" : "text-gray-400"}>
          Showing: <strong className={isDark ? "text-purple-400" : "text-purple-600"}>{filterTotalEvents?.toLocaleString()}</strong>
        </span>
      </div>
    </div>
  );
};

export default RightSliders;
