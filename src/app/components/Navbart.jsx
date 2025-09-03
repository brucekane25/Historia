"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Map";
import GithubIcon from "@mui/icons-material/GitHub";

function Navbart({
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

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 8,
        left: "35%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: 800,
        borderRadius: 3,
        boxShadow: 4,
        overflow: "hidden",
        zIndex: 1000,
      }}
    >
      <AppBar
        position="static"
        sx={{
          borderRadius: 3,
          background: "rgba(255,255 ,255 , 0.5)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <AdbIcon sx={{ color:"black", mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontWeight: 700,
                letterSpacing: ".1rem",
                color: "black",
                textDecoration: "none",
              }}
            >
              Historia
            </Typography>

            {/* Menu button for small screens */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                
              >
                <MenuIcon  sx={{}}  color=""/>
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
              >
                <MenuItem onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">Dashboard</Typography>
                </MenuItem>
                <MenuItem onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">About</Typography>
                </MenuItem>
              </Menu>
            </Box>

            {/* Desktop Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {/* <Button onClick={handleCloseNavMenu} sx={{ color: "black" }}>
                Dashboard
              </Button> */}
              <Button onClick={handleCloseNavMenu} sx={{ color: "black" }}>
                About
              </Button>
            </Box>

            {/* Right icons */}
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="GitHub">
                <IconButton
                  sx={{ p: 0, color: "black" }}
                  href="https://github.com/brucekane25"
                  target="_blank"
                >
                  <GithubIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}

export default Navbart;
