"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const RightSliders = ({
  pages,
  lightMode,
  currentPage,
  setCurrentPage,
  setLimit,
  limit,
  filterTotalEvents,
  totalEvents,
  isLoading,
}) => {
  const isDark = !lightMode;
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
    <div className="space-y-4 w-full" aria-busy={isLoading}>
      {/* Events Per Page */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-xs ${isDark ? "text-parchment/50" : "text-dim"}`}>
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
            className={`w-20 text-center text-sm font-mono rounded-[3px] border ${isDark
              ? "bg-parchment/5 border-hairline text-parchment focus:border-cinnabar/50"
              : "bg-ink/5 border-hairline text-parchment focus:border-cinnabar/35"
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
          disabled={currentPage === 1 || isLoading}
          onClick={() => setCurrentPage((p) => p - 1)}
          className={`rounded-[3px] ${isDark
            ? "border-hairline text-parchment/70 hover:bg-parchment/10 disabled:opacity-30"
            : "border-hairline text-parchment hover:bg-ink/5 disabled:opacity-30"
            }`}
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          Prev
        </Button>
        <span className={`text-xs font-mono ${isDark ? "text-parchment/60" : "text-dim"}`}>
          {currentPage}/{pages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === pages || isLoading}
          onClick={() => setCurrentPage((p) => p + 1)}
          className={`rounded-[3px] ${isDark
            ? "border-hairline text-parchment/70 hover:bg-parchment/10 disabled:opacity-30"
            : "border-hairline text-parchment hover:bg-ink/5 disabled:opacity-30"
            }`}
        >
          Next
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <span className={isDark ? "text-parchment/30" : "text-dim"}>
          Total: <strong className={isDark ? "text-parchment/60" : "text-dim"}>{totalEvents?.toLocaleString()}</strong>
        </span>
        <span className={`flex items-center gap-1 ${isDark ? "text-parchment/30" : "text-dim"}`}>
          Showing: <strong className={"text-cinnabar"}>{filterTotalEvents?.toLocaleString()}</strong>
          {isLoading && <Loader2 className="w-3 h-3 animate-spin" aria-label="Loading" />}
        </span>
      </div>
    </div>
  );
};

export default RightSliders;
