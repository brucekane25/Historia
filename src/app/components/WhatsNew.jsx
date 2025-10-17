
import React, { useState, useEffect } from 'react';
import { Button, Modal, Typography, Paper, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const LATEST_VERSION = '1.0.0'; // Update this version when you have new features to announce

const WhatsNew = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    if (lastSeenVersion !== LATEST_VERSION) {
      setIsOpen(true);
      localStorage.setItem('lastSeenVersion', LATEST_VERSION);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="whats-new-modal-title"
      aria-describedby="whats-new-modal-description"
      className="flex items-center justify-center"
    >
      <Paper className="p-8 m-4 max-w-lg w-full bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <Typography id="whats-new-modal-title" variant="h5" component="h2" className="text-gray-800">
            What's New in Gloria
          </Typography>
          <IconButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </div>
        <Typography id="whats-new-modal-description" className="text-gray-600 mb-6">
          Here are the latest features and improvements we've added to Gloria:
        </Typography>
        <div className="mb-6">
          <ul className="list-disc list-inside text-gray-600">
            <li><b>Onboarding Experience:</b> A new onboarding process to help you get started.</li>
            <li><b>Performance Improvements:</b> We've made some under-the-hood changes to improve performance.</li>
            <li><b>Bug Fixes:</b> We've squashed some bugs to make your experience smoother.</li>
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

export default WhatsNew;
