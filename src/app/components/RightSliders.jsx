"use client"
import React, { useState } from 'react';
import { themes } from '../themes/colorThemes';
import { Button, Slider, Typography, Input } from '@mui/material';

const RightSliders = ({ pages, mode, currentPage, setCurrentPage, setLimit, limit, filterTotalEvents, totalEvents }) => {
  const [sliderValue, setSliderValue] = useState(limit);

  // Handle live change (for Input & Slider)
  const handleSliderChange = (e, newValue) => {
    const value = typeof newValue === 'number' ? newValue : Number(e.target.value);
    setSliderValue(value);
  };

  // Commit value (when slider stops or input loses focus)
  const handleSliderChangeCommitted = () => {
    if (!Number.isNaN(sliderValue) && sliderValue >= 1 && sliderValue <= 10000) {
      setLimit(sliderValue);
    } else {
      setSliderValue(limit); // Reset on invalid input
    }
  };

  return (
    <div className="Right-Sliders flex flex-col justify-center w-full items-center space-y-6 ">
      <div className="flex flex-col items-center space-y-4 w-[90%]">

        {/* Events Per Page with Input */}
        <Typography sx={{color: mode ? themes.light.text : themes.dark.text}} variant="subtitle1" className=" pb-4 ">
          Events Per Page:
          <Input
            value={sliderValue}
            size="small"
            sx={{
              color: 'inherit',
              paddingLeft: '20px',
              '&:before': {
                borderBottomColor: mode ? themes.light.text : themes.dark.text, // Default underline color
              },
              '&:after': {
                borderBottomColor: 'purple', // Active (focused) underline color
              },
            }}
            onChange={handleSliderChange} // Live change
            onBlur={handleSliderChangeCommitted} // Commit on blur
            onKeyDown={(e) => e.key === 'Enter' && handleSliderChangeCommitted()} // Commit on Enter
            inputProps={{
              step: 1,
              min: 1,
              max: 10000,
              type: 'number',
              'aria-labelledby': 'input-slider-start',
            }}
          />
        </Typography>

        {/* Slider Component */}
        <Slider
          value={sliderValue}
          onChange={handleSliderChange} // Live change
          onChangeCommitted={handleSliderChangeCommitted} // Commit on stop sliding
          valueLabelDisplay="on"
          min={1}
          color={mode?'success':'error'}
          max={10000}
          aria-labelledby="events-per-page-slider"
        />

        {/* Pagination Buttons */}
        <div className="flex items-center space-x-4">
          <Button
            variant="contained"
            style={{
              backgroundColor: mode ? themes.light.background : themes.dark.background,
              color: mode ? themes.light.text : themes.dark.text,
            }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="disabled:bg-gray-300 w-[100px] disabled:text-gray-500"
          >
            Previous
          </Button>

          <Typography sx={{color: mode ? themes.light.text : themes.dark.text}} variant="body1" className="text-gray-700">
            Page {currentPage} of {pages}
          </Typography>

          <Button
            variant="contained"
            style={{
              backgroundColor: mode ? themes.light.background : themes.dark.background,
              color: mode ? themes.light.text : themes.dark.text,
            }}
            disabled={currentPage === pages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="disabled:bg-gray-300 w-[100px] disabled:text-gray-500"
          >
            Next
          </Button>
        </div>

        {/* Total Events Info */}
        <Typography sx={{color: mode ? themes.light.text : themes.dark.text}} className="text-3xl text-gray-600">
          Total Events: {totalEvents}
          , Filtered Events: {filterTotalEvents}
        </Typography>
      </div>
    </div>
  );
};

export default RightSliders;
