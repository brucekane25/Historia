"use client"
import { Drawer } from "@mui/material";
import { useState } from "react";
import EventTimeline from "./EventTimeline";
import { themes } from "../themes/colorThemes";
import { styled, Fab } from "@mui/material";
import { Cancel } from "@mui/icons-material";

const LeftDrawer = ({isDesktop, isLeftOpen, setisLeftOpen, events ,onEventClick, mode}) => {
  const toggleDrawer = (newOpen) => () => {
    setisLeftOpen(newOpen);
  };
 const StyledFab = styled(Fab)({
    margin: "0",
  });
  return (
    <>
      <Drawer
        variant="temporary"
        anchor="left"
        open={isLeftOpen}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            minWidth: isDesktop? '330px':'290px', 
            maxWidth: isDesktop?'30vw':'30vw', 
            backgroundColor: mode?themes.light.pbackground:themes.dark.primary ,
            color: mode?themes.light.text:themes.dark.text ,
            boxShadow: "0 0 30px rgba(0, 0, 0, 0.5)",
            position: 'absolute', 
            left: isDesktop?'15px':'15px',
            top: isDesktop? '8vh':'4vh', 
            height: isDesktop?'90vh':'90vh',
            borderRadius:'10px',
            overflow: "hidden" 
          },
        }}
        sx={{
          '--Drawer-transitionDuration': isLeftOpen ? '0.4s' : '0.2s',
          '--Drawer-transitionFunction': isLeftOpen
            ? 'cubic-bezier(0.79,0.14,0.15,0.86)'
            : 'cubic-bezier(0.77,0,0.18,1)',
        }}
      >
        <div className="flex items-center mt-3  mb-2 justify-between px-4">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <StyledFab

              title="Close"
              onClick={() => {
                setisLeftOpen(false);
              }}
              sx={{
                height:'20px',
                width:'20px',
                padding:'20px',
                backgroundColor: mode ? themes.light.background : "gray",
                ":hover": {
                  backgroundColor: mode
                    ? themes.light.sbackground
                    : themes.dark.background,
                },
              }}
            >
              <Cancel sx={{ color: !mode ? "white" : "black" }} />
            </StyledFab>
        </div>
        <div className= "">
          <EventTimeline mode={mode} events={events} isLeftOpen={isLeftOpen} setisLeftOpen ={setisLeftOpen} onEventClick={onEventClick}/>
        </div>
      </Drawer>
    </>
  );
};

export default LeftDrawer;
