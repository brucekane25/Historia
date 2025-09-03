"use client"
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Input from '@mui/material/Input';
import Stack from '@mui/material/Stack';

const VerticalSlider = ({ setSelectedEvent, yearRange, setYearRange }) => {
  const [temporaryRange, setTemporaryRange] = useState([yearRange.startYear, yearRange.endYear]);

  const handleChange = (event, newValue) => {
    setTemporaryRange(newValue);
  };

  const handleChangeCommitted = (event, newValue) => {
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
    <Box
      sx={{
        backgroundColor: 'white',
        paddingX: '9px',
        borderRadius: '8px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
       
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '56vh',
            width: '100%',
          }}
        >
          <Typography variant="caption" sx={{ mb: 1, color: 'gray' }}>
            End Year
          </Typography>
          <Input
            value={temporaryRange[1]}
            size="small"
            onChange={handleInputChangeEnd}
            onBlur={handleInputBlurEnd}
            inputProps={{
              step: 1,
              min: -1458,
              max: 2024,
              type: 'number',
              'aria-labelledby': 'input-slider-end',
            }}
            sx={{
              width: '70px',
              textAlign: 'center',
              mb: 2,
              border: '1px  #ccc',
              borderRadius: '4px',
            }}
          />
          <Slider
            getAriaLabel={() => 'Year range'}
            value={temporaryRange}
            onChange={handleChange}
            orientation="vertical"
            onChangeCommitted={handleChangeCommitted}
            valueLabelDisplay="on"
            min={-1458}
            max={2024}
            aria-labelledby="range-slider"
            color="secondary"
            sx={{ height:'full' ,minHeight: '70px' }}
          />
          <Input
            value={temporaryRange[0]}
            size="small"
            onChange={handleInputChangeStart}
            onBlur={handleInputBlurStart}
            inputProps={{
              step: 1,
              min: -1458,
              max: 2024,
              type: 'number',
              'aria-labelledby': 'input-slider-start',
            }}
            sx={{
              width: '70px',
              textAlign: 'center',
              mt: 2,
              border: '1px  #ccc',
              borderRadius: '4px',
            }}
          />
          <Typography variant="caption" sx={{ mt: 1, color: 'gray' }}>
            Start Year
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default VerticalSlider;
