
import React, { useState, useEffect } from 'react';
import { Button, Modal, Typography, Paper, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Onboarding = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      setIsOpen(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="onboarding-modal-title"
      aria-describedby="onboarding-modal-description"
      className="flex items-center justify-center"
    >
      <Paper className="p-8 m-4 max-w-lg w-full bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <Typography id="onboarding-modal-title" variant="h5" component="h2" className="text-gray-800">
            Welcome to Gloria!
          </Typography>
          <IconButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </div>
        <Typography id="onboarding-modal-description" className="text-gray-600 mb-6">
          Gloria is an interactive map that allows you to explore historical events across different time periods and regions.
        </Typography>
        <div className="mb-6">
          <Typography variant="h6" className="text-gray-700 mb-2">
            Key Features:
          </Typography>
          <ul className="list-disc list-inside text-gray-600">
            <li><b>Interactive Map:</b> Click on markers to view event details.</li>
            <li><b>Timeline Slider:</b> Use the timeline to filter events by year.</li>
            <li><b>Event Categories:</b> Filter events by category to focus on what interests you.</li>
            <li><b>Settings Panel:</b> Customize your experience with different themes and settings.</li>
            <li><b>Random Events:</b> Discover new events by clicking the "randomize" button.</li>
          </ul>
        </div>
        <div className="text-right">
          <Button onClick={handleClose} variant="contained" color="primary">
            Got It!
          </Button>
        </div>
      </Paper>
    </Modal>
  );
};

export default Onboarding;
