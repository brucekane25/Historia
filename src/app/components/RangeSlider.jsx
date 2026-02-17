"use client";
import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

const RangeSlider = ({ setSelectedEvent, yearRange, setYearRange, mode }) => {
  const isDark = !mode;
  const [temporaryRange, setTemporaryRange] = useState([
    yearRange.startYear,
    yearRange.endYear,
  ]);

  useEffect(() => {
    setTemporaryRange([yearRange.startYear, yearRange.endYear]);
  }, [yearRange]);

  const handleChange = (newValue) => {
    setTemporaryRange(newValue);
  };

  const handleChangeCommitted = (newValue) => {
    setYearRange({ startYear: newValue[0], endYear: newValue[1] });
    if (setSelectedEvent) {
      setSelectedEvent({ startYear: newValue[0], endYear: newValue[1] });
    }
  };

  const handleInputChange = (index, event) => {
    const newValue = Number(event.target.value);
    const updatedRange = [...temporaryRange];
    updatedRange[index] = newValue;
    setTemporaryRange(updatedRange);
  };

  const handleInputBlur = () => {
    let [startYear, endYear] = temporaryRange;
    startYear = Math.max(-1458, Math.min(startYear, 2024));
    endYear = Math.max(-1458, Math.min(endYear, 2024));
    if (startYear > endYear) startYear = endYear;

    setTemporaryRange([startYear, endYear]);
    setYearRange({ startYear, endYear });
    if (setSelectedEvent) {
      setSelectedEvent({ startYear, endYear });
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className={isDark ? "text-white/40" : "text-gray-400"}>
          From
        </span>
        <span className={isDark ? "text-white/40" : "text-gray-400"}>
          To
        </span>
      </div>
      <div className="flex justify-between gap-3 items-center">
        <Input
          type="number"
          value={temporaryRange[0]}
          onChange={(e) => handleInputChange(0, e)}
          onBlur={handleInputBlur}
          onKeyDown={(e) => e.key === "Enter" && handleInputBlur()}
          min={-1458}
          max={2024}
          step={1}
          className={`w-[90px] text-center text-sm font-mono rounded-lg border transition-colors ${isDark
              ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50"
              : "bg-black/5 border-black/10 text-gray-900 focus:border-purple-500"
            }`}
        />
        <div className="flex-1">
          <Slider
            value={temporaryRange}
            onValueChange={handleChange}
            onValueCommit={handleChangeCommitted}
            min={-1458}
            max={2024}
            step={1}
            aria-labelledby="range-slider"
          />
        </div>
        <Input
          type="number"
          value={temporaryRange[1]}
          onChange={(e) => handleInputChange(1, e)}
          onBlur={handleInputBlur}
          onKeyDown={(e) => e.key === "Enter" && handleInputBlur()}
          min={-1458}
          max={2024}
          step={1}
          className={`w-[90px] text-center text-sm font-mono rounded-lg border transition-colors ${isDark
              ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-purple-500/50"
              : "bg-black/5 border-black/10 text-gray-900 focus:border-purple-500"
            }`}
        />
      </div>
    </div>
  );
};

export default RangeSlider;