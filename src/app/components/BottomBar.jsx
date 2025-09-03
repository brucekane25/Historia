"use client"
import * as React from "react";
import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Fab from "@mui/material/Fab";
import MenuIcon from "@mui/icons-material/Menu";
import UpIcon from "@mui/icons-material/CasinoTwoTone";
import SunIcon from "@mui/icons-material/WbSunny";
import MoonIcon from "@mui/icons-material/DarkMode";
import Timeline from "@mui/icons-material/Timeline";

import SearchIcon from "@mui/icons-material/Search";
import MoreIcon from "@mui/icons-material/Timeline";
import CommitIcon from "@mui/icons-material/Settings";
import { themes } from "../themes/colorThemes";

const StyledFab = styled(Fab)({
  position: "absolute",
  zIndex: 1,
  top: -30,
  left: 0,
  right: 0,
  margin: "0 auto",
});

export default function BottomAppBar({
  setIsSlider,
  isSlider,
  isLeftOpen,
  settings,
  setsettings,
  setisLeftOpen,
  mode,
  setmode,
}) {
  return (
    <>
      <AppBar
        position="fixed"
        color="info"
        sx={{
          backgroundColor: mode
            ? themes.light.pbackground
            : themes.dark.pbackground,
          color: mode ? themes.light.text : themes.dark.text,
          top: "auto",
          maxHeight: "fit",
          bottom: 0,
        }}
      >
        <Toolbar>
          <IconButton
            title="Timeline"
            color="inherit"
            onClick={() => setisLeftOpen(!isLeftOpen)}
            aria-label="open drawer"
            >
            <Timeline />
          </IconButton>
          <StyledFab
            title="Random Events"
            onClick={() => setIsSlider(!isSlider)}
            color={mode ? "success" : "error"}
            aria-label="Open"
            >
            <UpIcon />
          </StyledFab>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            title={`${mode ? "Dark Mode" : "Light Mode"}`}
            onClick={() => {
              setmode(!mode);
            }}
            color="inherit"
            >
            {mode ? (
              <MoonIcon sx={{ color: !mode ? "white" : "black" }} />
            ) : (
              <SunIcon sx={{ color: !mode ? "white" : "black" }} />
            )}
          </IconButton>
          <IconButton  title="Tweaks" onClick={() => setsettings(!settings)} color="inherit">
            
            <CommitIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
}
