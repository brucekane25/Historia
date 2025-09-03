"use client"
import { Button, Drawer, IconButton, SwipeableDrawer } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useEffect, useState } from "react";
import { themes } from "../themes/colorThemes";
import { styled, Fab } from "@mui/material";
import { Cancel, Casino, Handyman } from "@mui/icons-material";

const Pane = ({
  isOpen,
  setIsOpen,
  mode,
  events,
  randomEvents,
  randomizeEvents,
  onEventClick,
}) => {
  const StyledFab = styled(Fab)({
    margin: "0 auto",
  });

  return (
    <>
      <Drawer
        variant="persistent"
        anchor="right"
        open={isOpen}
        sx={{
          "& .MuiDrawer-paper": {
            width: "30%",
            backgroundColor: mode
              ? themes.light.background
              : themes.dark.background,
            color: mode ? themes.light.text : themes.dark.text,
            boxShadow: "0 0 30px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <div className="flex items-center mt-3 px-4 pb-3 justify-between">
          <h2 className="text-lg font-semibold">Random Events</h2>
          <div className="flex gap-1 justify-normal items-center">
            <Button
              onClick={randomizeEvents}
              style={{
                backgroundColor: mode
                  ? themes.light.sbackground
                  : themes.dark.sbackground,
                color: mode ? themes.light.text : themes.dark.text,
              }}
              className="px-4 py-2 flex gap-1"
            >
              <Casino/>
              Randomize
            </Button>
            <StyledFab

              title="Close"
              onClick={() => {
                setIsOpen(false);
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
        </div>

        <div className="p-4 overflow-y-auto">
          <ul className="space-y-4">
            {randomEvents.map((event) => (
              <li
                key={event._id}
                className="p-3 bg-white rounded shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onEventClick(event)}
                style={{
                  backgroundColor: mode
                    ? themes.light.sbackground
                    : themes.dark.sbackground,
                  color: mode ? themes.light.text : themes.dark.text,
                }}
              >
                <div className="flex items-center justify-between">
                  {/* Thumbnail */}
                  <div
                    className={`h-16 min-w-16 rounded-md ${
                      event.thumbnail ? "overflow-hidden" : "bg-gray-300"
                    }`}
                  >
                    {event.thumbnail ? (
                      <img
                        src={event.thumbnail}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="flex-grow ml-4">
                    <h3 className="text-base font-medium line-clamp-2">
                      {event.title}
                    </h3>
                    <p
                      style={{
                        backgroundColor: mode
                          ? themes.light.background
                          : themes.dark.background,

                        color: mode ? "green" : "red",
                      }}
                      className="text-sm w-fit my-1 py-1 px-2 rounded-md text-gray-600"
                    >
                      {event.year}
                    </p>
                  </div>

                  <div className="bg-gray-500 text-white text-sm px-2 py-1 rounded">
                    {event.category}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Drawer>
    </>
  );
};

export default Pane;
