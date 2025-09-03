"use client"
import React, { useEffect, useState } from "react";
import { themes } from "../themes/colorThemes";
import Settings from "@mui/icons-material/Settings";
import SunIcon from "@mui/icons-material/WbSunny";
import MoonIcon from "@mui/icons-material/DarkMode";
import Dice from "@mui/icons-material/Casino";
import Timeline from "@mui/icons-material/Timeline";
import { Fab, styled } from "@mui/material";
import { Handyman } from "@mui/icons-material";

// Styled FAB
const StyledFab = styled(Fab)({
  margin: "0 auto",
    transition: "transform 0.3s ease, opacity 0.3s ease",
});

// Keyframe animations using inline <style>
const fabAnimations = `
@keyframes slideUp {
  0% { transform: translateX(40px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes slideDown {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(40px); opacity: 0; }
}
`;

const SettingsIcons = ({
  panel,
  setPanel,
  setisLeftOpen,
  isLeftOpen,
  setmode,
  mode,
  setIsOpen,
  isOpen,
  setsettings,
  settings,
}) => {
  const [showIcons, setShowIcons] = useState(panel);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (panel) {
      setShowIcons(true);
    } else {
      setAnimating(true);
      setTimeout(() => {
        setShowIcons(false);
        setAnimating(false);
      }, 300); // match animation duration
    }
  }, [panel]);

  return (
    <>
      <style>{fabAnimations}</style>

      {showIcons ? (
        <div
          className="absolute flex flex-col items-end gap-2 bottom-[18%] right-6 z-[999]"
          style={{
            animation: panel
              ? "slideUp 0.3s ease forwards"
              : "slideDown 0.3s ease forwards",
          }}
        >
          {/* <StyledFab
            title="Timeline"
            onClick={() => setisLeftOpen(!isLeftOpen)}
            sx={{
              backgroundColor: mode ? themes.light.background : "gray",
              ":hover": {
                backgroundColor: mode
                  ? themes.light.sbackground
                  : themes.dark.background,
              },
            }}
          > */}
            <SettingsPlaceholder mode={mode} onClick={() => {
              setisLeftOpen(!isLeftOpen)
            }
            }>

            <Timeline
              // sx={{ color: !mode ? "white" : "black" }} 
              />
            Timeline
            </SettingsPlaceholder>
            
          {/* </StyledFab> */}

          {/* <StyledFab
            onClick={() => setmode(!mode)}
            title={mode ? "Dark Mode" : "Light Mode"}
            sx={{
              backgroundColor: mode ? themes.light.background : "gray",
              ":hover": {
                backgroundColor: mode
                  ? themes.light.sbackground
                  : themes.dark.background,
              },
            }}
          > */}

            <SettingsPlaceholder mode={mode} onClick={() => {
              setmode(!mode)
            }
            }>
              
            {mode ? (<>
              <MoonIcon
                //  sx={{ color: !mode ? "white" : "black" }} 
                 />
              Dark Mode
            </>
            ) : (<>
              <SunIcon
              // sx={{ color: !mode ? "white" : "black" }} 
              />
            Light Mode  
            </>
            )}

            </SettingsPlaceholder>
          {/* </StyledFab> */}

          {/* <StyledFab
            title="Random Events"
            sx={{
              backgroundColor: mode ? themes.light.background : "gray",
              ":hover": {
                backgroundColor: mode
                  ? themes.light.sbackground
                  : themes.dark.background,
              },
            }}
            onClick={() => setIsOpen(!isOpen)}
          > */}
            <SettingsPlaceholder mode={mode} onClick={() => {
              setIsOpen(!isOpen)
            }
            }>

            <Dice
            //  sx={{ color: !mode ? "white" : "black" }} 
             />
            Random Events
            </SettingsPlaceholder>
          {/* </StyledFab> */}

          {/* <StyledFab
            title="Tweaks"
            sx={{
              backgroundColor: mode ? themes.light.background : "gray",
              ":hover": {
                backgroundColor: mode
                  ? themes.light.sbackground
                  : themes.dark.background,
              },
            }}
            onClick={() => setsettings(!settings)}
          > */}
               <SettingsPlaceholder onClick={() => setsettings(!settings)} mode={mode}>

            <Settings 
            // sx={{ color: !mode ? "white" : "black" }} 
            />
            Tweaks
               </SettingsPlaceholder>
          {/* </StyledFab> */}

          {/* <StyledFab
            title="Settings"
            onClick={() => setPanel(!panel)}
            sx={{
              backgroundColor: mode ? themes.light.background : "gray",
              ":hover": {
                backgroundColor: mode
                  ? themes.light.sbackground
                  : themes.dark.background,
              },
            }}
          > */}
        {/* <SettingsPlaceholder onClick={() => setPanel(!panel)} mode={mode}>
            <Handyman 
            sx={{ 
              // color: !mode ? "white" : "black" 
            }} 

            />
            Settings
          </SettingsPlaceholder>   */}
          {/* </StyledFab> */}
          
        </div>
      ) : (
        !animating && (<></>
        )
      )}
          <div className="absolute bottom-[8%] right-6 z-[999]">
            
              <SettingsPlaceholder
                mode={mode}
               onClick={() => {
                setPanel(!panel)
              }
              }>

              <Handyman 
              // sx={{ color: !mode ? "white" : "black" }}
               />
              Settings
              </SettingsPlaceholder>
          </div>
    </>
  );
};

export default SettingsIcons;





const SettingsPlaceholder = ({children,mode,onClick}) => {
  return (
    <div
    onClick={onClick}
    style={{
      color:themes.light.text
      // backgroundColor:mode?themes.light.background:themes.dark.sbackground,
      
      // color:mode?themes.light.text:themes.dark.text,
    }} 
    className={` flex hover:cursor-pointer bg-white/50 hover:backdrop-invert-25 hover:scale-105 shadow-2xl ${mode?'shadow-black':'shadow-white/25'}  backdrop-blur-xl justify-between items-center rounded-4xl p-4 gap-4 w-fit`}>
      {children}
    </div>
  )
}


