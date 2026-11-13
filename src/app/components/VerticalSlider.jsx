"use client";
import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

const VerticalSlider = ({ setSelectedEvent, yearRange, setYearRange, lightMode }) => {
  const isDark = !lightMode;
  const [temporaryRange, setTemporaryRange] = useState([
    yearRange.startYear,
    yearRange.endYear,
  ]);

  const handleChange = (newValue) => {
    setTemporaryRange(newValue);
  };

  const handleChangeCommitted = (newValue) => {
    setYearRange({ startYear: newValue[0], endYear: newValue[1] });
    setSelectedEvent({ startYear: newValue[0], endYear: newValue[1] });
  };

  const handleInputChangeStart = (event) => {
    const newValue = Number(event.target.value) || yearRange.startYear;
    setTemporaryRange([newValue, temporaryRange[1]]);
  };

  const handleInputChangeEnd = (event) => {
    const newValue = Number(event.target.value) || yearRange.endYear;
    setTemporaryRange([temporaryRange[0], newValue]);
  };

  const handleInputBlurStart = () => {
    const [startYear, endYear] = temporaryRange;
    if (startYear < -1458) setTemporaryRange([-1458, endYear]);
    else if (startYear > endYear) setTemporaryRange([endYear, endYear]);
  };

  const handleInputBlurEnd = () => {
    const [startYear, endYear] = temporaryRange;
    if (endYear > 2024) setTemporaryRange([startYear, 2024]);
    else if (endYear < startYear) setTemporaryRange([startYear, startYear]);
  };

  return (
    <div
      className={`px-2 py-3 rounded-[3px] shadow-xl ${isDark ? "glass-dark" : "glass"
        }`}
      style={{
        border: "1px solid color-mix(in srgb, var(--parchment) 6%, transparent)",
      }}
    >
      <div className="flex flex-row space-x-2 items-center justify-center">
        <div className="flex flex-col items-center h-[56vh] w-full">
          <p className={`text-[10px] mb-1 ${isDark ? "text-parchment/40" : "text-dim"}`}>
            End
          </p>
          <Input
            value={temporaryRange[1]}
            onChange={handleInputChangeEnd}
            onBlur={handleInputBlurEnd}
            type="number"
            min={-1458}
            max={2024}
            step={1}
            className={`w-16 text-center text-xs font-mono mb-2 rounded-[3px] border ${isDark
              ? "bg-parchment/5 border-hairline text-parchment"
              : "bg-ink/5 border-hairline text-parchment"
              }`}
          />
          <Slider
            value={temporaryRange}
            onValueChange={handleChange}
            onValueCommit={handleChangeCommitted}
            orientation="vertical"
            min={-1458}
            max={2024}
            step={1}
            className="h-full min-h-[70px]"
          />
          <Input
            value={temporaryRange[0]}
            onChange={handleInputChangeStart}
            onBlur={handleInputBlurStart}
            type="number"
            min={-1458}
            max={2024}
            step={1}
            className={`w-16 text-center text-xs font-mono mt-2 rounded-[3px] border ${isDark
              ? "bg-parchment/5 border-hairline text-parchment"
              : "bg-ink/5 border-hairline text-parchment"
              }`}
          />
          <p className={`text-[10px] mt-1 ${isDark ? "text-parchment/40" : "text-dim"}`}>
            Start
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerticalSlider;
