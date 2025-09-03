"use client";
import "./globals.css"
import { useState, useEffect } from "react";
// import MapComponent from "./components/MapComponent";
import apiClient from "./api/axios";
import Navbart from "./components/Navbart";
import Backdrop from "./components/Backdrop";
import Drawer from "./components/Pane";
import categorizeEvents from "./components/CategoriseEvents";
import Fab from "@mui/material/Fab";
import { styled } from "@mui/material/styles";
import LeftSliders from "./components/LeftSliders";
import RightSliders from "./components/RightSliders";
import AlternativeDrawer from "./components/AlternativeDrawer";
import { Icon, IconButton, useMediaQuery } from "@mui/material";

import BottomAppBar from "./components/BottomBar";
import LeftArrow from "@mui/icons-material/ArrowBackIosNewTwoTone";
import RightArrow from "@mui/icons-material/ArrowForwardTwoTone";
import Close from "@mui/icons-material/Close";
import DownArrow from "@mui/icons-material/ArrowDownwardTwoTone";
import Settings from "@mui/icons-material/Settings";
import SunIcon from "@mui/icons-material/WbSunny";
import MoonIcon from "@mui/icons-material/DarkMode";
import Dice from "@mui/icons-material/Casino";
import Timeline from "@mui/icons-material/Timeline";
import VerticalSlider from "./components/VerticalSlider";
import { themes } from "./themes/colorThemes";
import LeftDrawer from "./components/LeftDrawer";
import SettingsPanel from "./components/SettingsPanel";
import SettingsIcons from "./components/SettingsIcons";
import dynamic from "next/dynamic";
const MapComponent = dynamic(() => import("./components/MapComponent"),{ssr:false}
)
export default function Home() {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filterpages, setFilterPages] = useState(0);
  const [panel, setPanel] = useState(true);
  const [limit, setLimit] = useState(2200);
  const [selectedCategory, setSelectedCategory] = useState([]);
  
  const [randomEvents, setRandomEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [filterTotalEvents, setFilterTotalEvents] = useState(null);
  const [yearRange, setYearRange] = useState({
    startYear: -479,
    endYear: 2000,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLeftOpen, setisLeftOpen] = useState(false);
  const [isSlider, setIsSlider] = useState(false);
  const [country, setcountry] = useState();
  const [mode, setmode] = useState(true);
  const [settings, setsettings] = useState(false);

  const StyledFab = styled(Fab)({
    margin: "0 auto",
  });
  const getRandomEvents = (count) => {
    const filteredEvents = events.filter((event) => event.thumbnail !== null);
    const shuffled = filteredEvents.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const randomizeEvents = () => {
    setRandomEvents(getRandomEvents(16));
    setSelectedEvent(null);
  };
  const handleMobileSlider = () => {
    setMobileSlider(!mobileSlider);
  };
  const [mobileSlider, setMobileSlider] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    randomizeEvents();
  }, [events]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchEventsWithCoordinates(
        currentPage,
        limit,
        yearRange.startYear,
        yearRange.endYear
      );
      setOpen(false);
      if (data) {
        const categorizedEvents = await categorizeEvents(data.events);

        const filterEvents =
          selectedCategory.length > 0
            ? categorizedEvents.filter((event) =>
                selectedCategory.includes(event.category)
              )
            : categorizedEvents;

        setEvents(filterEvents);
        setPages(data.totalPages);
        setTotalEvents(data.totalEvents);
        setFilterTotalEvents(filterEvents.length);
      }
    };
    fetchData();
    setSelectedEvent(null);
  }, [currentPage, yearRange, selectedCategory, limit]);

  const fetchEventsWithCoordinates = async (
    page,
    limit,
    startYear,
    endYear
  ) => {
    setOpen(true);
    try {
      const response = await apiClient.get("/coordinates", {
        params: { page, limit, startYear, endYear },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching events with coordinates:", error);
      return null;
    }
  };

  return (
    <div className="">
      {!isDesktop && mobileSlider && (
        <div className="fixed z-[999] bottom-[47vh] top-auto translate-y-1/2 right-2 flex flex-col items-center gap-2">
          <VerticalSlider
            className=""
            setSelectedEvent={setSelectedEvent}
            yearRange={yearRange}
            setYearRange={setYearRange}
          />
        </div>
      )}

      {!isDesktop && isSlider && (
        <div className="fixed z-[9999] bottom-[5vh] top-auto left-1/2 -translate-x-1/2">
          <button onClick={() => setIsSlider(!isSlider)}>
            <StyledFab color={mode ? "success" : "error"}>
              <DownArrow />
            </StyledFab>
          </button>
        </div>
      )}

      <div className="main-cont h-screen w-screen overflow-hidden">
        <LeftDrawer
          isDesktop={isDesktop}
          setisLeftOpen={setisLeftOpen}
          isLeftOpen={isLeftOpen}
          mode={mode}
          events={events}
          onEventClick={setSelectedEvent}
        />
        <div
          className={`canvas flex flex-col relative  transition-all h-full
         ${isDesktop && isOpen ? "max-w-[70%]" : "w-full"}  
         `}
        >
          {isDesktop ? (
            <div
              className={`z-[99999]`}
            >
              <Navbart
                setSelectedEvent={setSelectedEvent}
                isLeftOpen={isLeftOpen}
                setisLeftOpen={setisLeftOpen}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                mode={mode}
                setmode={setmode}
                setcountry={setcountry}
              />
            </div>
          ) : (
            <BottomAppBar
              isSlider={isSlider}
              setisLeftOpen={setisLeftOpen}
              isLeftOpen={isLeftOpen}
              settings={settings}
              setsettings={setsettings}
              setIsSlider={setIsSlider}
              mode={mode}
              setmode={setmode}
            />
          )}
          {isDesktop && (
            <SettingsIcons
              panel={panel}
              setPanel={setPanel}
              setisLeftOpen={setisLeftOpen}
              isLeftOpen={isLeftOpen}
              setmode={setmode}
              mode={mode}
              setIsOpen={setIsOpen}
              isOpen={isOpen}
              setsettings={setsettings}
              settings={settings}
            />
          )}

          <div
            className={`absolute panel-cont   
    transition-opacity duration-500 ease-in-out 
    ${settings ? "opacity-100" : "opacity-0 pointer-events-none"}
    ${
      isDesktop
        ? "right-40 mr-20 top-[53%] -translate-y-1/2 z-[999]"
        : " h-[75vh] top-1/2 -translate-y-1/2 z-[9999]  left-1/2 -translate-x-1/2"
    }`}
          >
            <SettingsPanel
              isDesktop={isDesktop}
              setSelectedEvent={setSelectedEvent}
              yearRange={yearRange}
              setLimit={setLimit}
              setsettings={setsettings}
              pages={pages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              limit={limit}
              filterTotalEvents={filterTotalEvents}
              totalEvents={totalEvents}
              setYearRange={setYearRange}
              selectedCategory={selectedCategory}
              country={country}
              setcountry={setcountry}
              setSelectedCategory={setSelectedCategory}
              mode={mode}
            />
          </div>

          {isDesktop ? (
            <Drawer
              setIsOpen={setIsOpen}
              mode={mode}
              isOpen={isOpen}
              randomEvents={randomEvents}
              randomizeEvents={randomizeEvents}
              onEventClick={setSelectedEvent}
            />
          ) : (
            <AlternativeDrawer
              events={randomEvents}
              mode={mode}
              onEventClick={setSelectedEvent}
              isSlider={isSlider}
              randomizeEvents={randomizeEvents}
              setIsSlider={setIsSlider}
            />
          )}
          <div className="relative  h-full w-full">
            <Backdrop open={open} setOpen={setOpen} />
            <MapComponent
              events={events}
              // country={country}
              mode={mode}
              selectedEvent={selectedEvent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
