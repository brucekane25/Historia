"use client"
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Map";
import GithubIcon from "@mui/icons-material/GitHub";
import { themes } from "../themes/colorThemes";


function Navbar({
  isOpen,
  isLeftOpen,
  setisLeftOpen,
  setSelectedEvent,
  setIsOpen,
  setmode,
  mode,
  setcountry,
}) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <div className="">

    <AppBar
      position="sticky"
      sx={{
        height: "fit-content",
        color: mode ? themes.light.text : themes.dark.text,
        backgroundColor: mode ? themes.light.primary : themes.dark.primary,
      }}
      >
      <Container maxWidth="xl">
        <Toolbar
          className="flex items-center w-full justify-between"
          disableGutters
          >
          <div className="flex items-center ">
            <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              sx={{
                mr: 2,
                display: "flex",
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: "0rem",
                color: "inherit",
                textDecoration: "none",
              }}
              >
              Historia
            </Typography>
          </div>
          <div className="flex items-center gap-2">
          
            <Box sx={{ flexGrow: 0, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                color="inherit"
                >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: "block", md: "none" } }}
                ></Menu>
            </Box>
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Github Page">
                <IconButton
                  href="https://github.com/brucekane25/"
                  sx={{ p: 0 ,color: mode? themes.light.text:themes.dark.text}}
                  >
                  <GithubIcon className="scale-150"/>
                </IconButton>
              </Tooltip>
            </Box>
          </div>
        </Toolbar>
      </Container>
    </AppBar>
                  </div> 
  );
}

export default Navbar;
