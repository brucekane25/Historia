"use client"
import React, { useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import Input from "@mui/material/Input";
import { themes } from "../themes/colorThemes";

const RangeSlider = ({ setSelectedEvent, yearRange, setYearRange, mode }) => {
  const [temporaryRange, setTemporaryRange] = useState([
    yearRange.startYear,
    yearRange.endYear,
  ]);

  const handleChange = (event, newValue) => {
    setTemporaryRange(newValue);
  };

  const handleChangeCommitted = (event, newValue) => {
    setYearRange({ startYear: newValue[0], endYear: newValue[1] });
    setSelectedEvent({ startYear: newValue[0], endYear: newValue[1] });
  };

  const handleInputChange = (index, event) => {
    const newValue = Number(event.target.value) || temporaryRange[index];
    const updatedRange = [...temporaryRange];
    updatedRange[index] = newValue;
    setTemporaryRange(updatedRange);
  };

  const handleInputBlur = () => {
    let [startYear, endYear] = temporaryRange;

    // Ensure values stay within bounds
    startYear = Math.max(-1458, Math.min(startYear, 2024));
    endYear = Math.max(-1458, Math.min(endYear, 2024));

    // Ensure startYear is not greater than endYear
    if (startYear > endYear) {
      startYear = endYear;
    }

    setTemporaryRange([startYear, endYear]);
    setYearRange({ startYear, endYear });
    setSelectedEvent({ startYear, endYear });
  };

  return (
    <Box sx={{ minWidth: "100%" }}>
      <div className="flex items-center justify-between ">
        <Typography id="input-slider" textAlign="center" gutterBottom>
          Starting Year
        </Typography>
        <Typography id="input-slider" textAlign="center" gutterBottom>
          End Year
        </Typography>
      </div>
      <Grid container spacing={1} sx={{ alignItems: "stretch" }}>
        <Grid item>
          <Input
            value={temporaryRange[0]}
            size="small"
            sx={{
              marginRight:"-5px",
              color: "inherit",
              "&:before": {
                borderBottomColor: mode ? themes.light.text : themes.dark.text,
              },
              "&:after": {
                borderBottomColor: "purple",
              },
            }}
            onChange={(e) => handleInputChange(0, e)}
            onBlur={handleInputBlur}
            onKeyDown={(e) => e.key === "Enter" && handleInputBlur()}
            inputProps={{
              step: 1,
              min: -1458,
              max: 2024,
              type: "number",
              "aria-labelledby": "input-slider-start",
            }}
          />
        </Grid>
        <Grid item size={"grow"}>
          <Slider
            getAriaLabel={() => "Year range"}
            value={temporaryRange}
            onChange={handleChange}
            orientation="horizontal"
            onChangeCommitted={handleChangeCommitted}
            valueLabelDisplay="on"
            min={-1458}
            max={2024}
            aria-labelledby="range-slider"
            color={mode?'success':'error'}
            
          />
        </Grid>
        <Grid item>
          <Input
            value={temporaryRange[1]}
            size="small"
            sx={{
              marginLeft:"5px",
              color: "inherit",
              "&:before": {
                borderBottomColor: mode ? themes.light.text : themes.dark.text,
              },
              "&:after": {
                borderBottomColor: "purple",
              },
            }}
            onChange={(e) => handleInputChange(1, e)}
            onBlur={handleInputBlur}
            onKeyDown={(e) => e.key === "Enter" && handleInputBlur()}
            inputProps={{
              step: 1,
              min: -1458,
              max: 2024,
              type: "number",
              "aria-labelledby": "input-slider-end",
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RangeSlider;
