"use client";
import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { HISTORY_YEAR_MIN, HISTORY_YEAR_MAX } from "@/lib/history-range";

const RangeSlider = ({ setSelectedEvent, yearRange, setYearRange, lightMode }) => {
  const isDark = !lightMode;
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
      setSelectedEvent(null);
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
    startYear = Math.max(HISTORY_YEAR_MIN, Math.min(startYear, HISTORY_YEAR_MAX));
    endYear = Math.max(HISTORY_YEAR_MIN, Math.min(endYear, HISTORY_YEAR_MAX));
    if (startYear > endYear) startYear = endYear;

    setTemporaryRange([startYear, endYear]);
    setYearRange({ startYear, endYear });
    if (setSelectedEvent) {
      setSelectedEvent(null);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className={isDark ? "text-parchment/40" : "text-dim"}>
          From
        </span>
        <span className={isDark ? "text-parchment/40" : "text-dim"}>
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
          min={HISTORY_YEAR_MIN}
          max={HISTORY_YEAR_MAX}
          step={1}
          className={`w-[90px] text-center text-sm font-mono rounded-[3px] border transition-colors ${isDark
            ? "bg-parchment/5 border-hairline text-parchment placeholder:text-parchment/30 focus:border-cinnabar/50"
            : "bg-ink/5 border-hairline text-parchment focus:border-cinnabar/35"
            }`}
        />
        <div className="flex-1">
          <Slider
            value={temporaryRange}
            onValueChange={handleChange}
            onValueCommit={handleChangeCommitted}
            min={HISTORY_YEAR_MIN}
            max={HISTORY_YEAR_MAX}
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
          min={HISTORY_YEAR_MIN}
          max={HISTORY_YEAR_MAX}
          step={1}
          className={`w-[90px] text-center text-sm font-mono rounded-[3px] border transition-colors ${isDark
            ? "bg-parchment/5 border-hairline text-parchment placeholder:text-parchment/30 focus:border-cinnabar/50"
            : "bg-ink/5 border-hairline text-parchment focus:border-cinnabar/35"
            }`}
        />
      </div>
    </div>
  );
};

export default RangeSlider;