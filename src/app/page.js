"use client";
import "./globals.css";
import { useState, useEffect, useCallback } from "react";
import Onboarding from "./components/Onboarding";
import WhatsNew from "./components/WhatsNew";
import apiClient from "./api/axios";
import Navbart from "./components/Navbart";
import categorizeEvents from "./components/CategoriseEvents";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import AlternativeDrawer from "./components/AlternativeDrawer";
import { useMediaQuery } from "@/lib/use-media-query";

import BottomAppBar from "./components/BottomBar";
import VerticalSlider from "./components/VerticalSlider";
import LeftDrawer from "./components/LeftDrawer";
import SettingsPanel from "./components/SettingsPanel";
import SettingsIcons from "./components/SettingsIcons";
import EventStats from "./components/EventStats";
import Pane from "./components/Pane";
import LoadingScreen from "./components/LoadingScreen";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";

const MapComponent = dynamic(() => import("./components/MapComponent"), {
  ssr: false,
});
const GlobeComponent = dynamic(() => import("./components/GlobeComponent"), {
  ssr: false,
});

export default function Home() {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
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
  const [mobileSlider, setMobileSlider] = useState(false);
  const [viewMode, setViewMode] = useState("map");
  const [isLoading, setIsLoading] = useState(true);
  
  // New states
  const [showTutorial, setShowTutorial] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  // Toggle dark class on html element
  useEffect(() => {
    const html = document.documentElement;
    if (!mode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [mode]);

  const getRandomEvents = useCallback(
    (count) => {
      const filteredEvents = events.filter(
        (event) => event.thumbnail !== null
      );
      const shuffled = filteredEvents.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    },
    [events]
  );

  const randomizeEvents = useCallback(() => {
    setRandomEvents(getRandomEvents(16));
    setSelectedEvent(null);
  }, [getRandomEvents]);

  useEffect(() => {
    randomizeEvents();
  }, [events, randomizeEvents]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await fetchEventsWithCoordinates(
        currentPage,
        limit,
        yearRange.startYear,
        yearRange.endYear
      );
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
      setIsLoading(false);
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

  const isDark = !mode;

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      <Onboarding
        forceOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
      <WhatsNew />

      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && events.length === 0 && <LoadingScreen isDark={isDark} />}
      </AnimatePresence>

      {/* Mobile Vertical Slider */}
      {!isDesktop && mobileSlider && (
        <div className="fixed z-[999] bottom-[47vh] top-auto translate-y-1/2 right-2 flex flex-col items-center gap-2">
          <VerticalSlider
            setSelectedEvent={setSelectedEvent}
            yearRange={yearRange}
            setYearRange={setYearRange}
            mode={mode}
          />
        </div>
      )}

      {/* Mobile slider close button */}
      {!isDesktop && isSlider && (
        <div className="fixed z-[9999] bottom-[5vh] top-auto left-1/2 -translate-x-1/2">
          <Button
            onClick={() => setIsSlider(!isSlider)}
            className={`rounded-full ${
              isDark
                ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                : "bg-purple-100 text-purple-600 hover:bg-purple-200"
            }`}
          >
            <ArrowDown />
          </Button>
        </div>
      )}

      <div className="main-cont h-screen w-screen overflow-hidden">
        {/* Left drawer */}
        <LeftDrawer
          isDesktop={isDesktop}
          setisLeftOpen={setisLeftOpen}
          isLeftOpen={isLeftOpen}
          mode={mode}
          events={events}
          onEventClick={setSelectedEvent}
        />

        <div
          className={`canvas flex flex-col relative transition-all h-full
           ${isDesktop && isOpen ? "max-w-[70%]" : "w-full"}
          `}
        >
          {/* Navbar / Bottom Bar */}
          {isDesktop ? (
            <div className="z-[99999]">
              <Navbart
                setSelectedEvent={setSelectedEvent}
                isLeftOpen={isLeftOpen}
                setisLeftOpen={setisLeftOpen}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                mode={mode}
                setmode={setmode}
                setcountry={setcountry}
                viewMode={viewMode}
                setViewMode={setViewMode}
                events={events}
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
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          )}

          {/* Desktop Settings Icons (Floating Dock) */}
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
              setStatsOpen={setStatsOpen}
            />
          )}

          {/* Settings Panel */}
          <div
            className={`absolute panel-cont   
              transition-opacity duration-500 ease-in-out 
              ${settings ? "opacity-100" : "opacity-0 pointer-events-none"}
              ${
                isDesktop
                  ? "right-40 mr-20 top-[53%] -translate-y-1/2 z-[999]"
                  : " h-[75vh] top-1/2 -translate-y-1/2 z-[9999] left-1/2 -translate-x-1/2"
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
              onShowTutorial={() => setShowTutorial(true)}
            />
          </div>
          
           {/* Event Stats Panel */}
           <div className={`absolute top-20 right-5 z-[990] hidden lg:block`}>
            <EventStats
              isOpen={statsOpen}
              onClose={() => setStatsOpen(false)}
              events={events}
              mode={mode}
            />
          </div>

          {/* Random Events Drawers */}
          {isDesktop ? (
            <Pane
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

          {/* Main View — Map or Globe */}
          <div className="relative h-full w-full">
            <AnimatePresence mode="wait">
              {viewMode === "map" ? (
                <motion.div
                  key="map"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="h-full w-full"
                >
                  <MapComponent
                    events={events}
                    mode={mode}
                    selectedEvent={selectedEvent}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="globe"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full w-full"
                >
                  <GlobeComponent
                    events={events}
                    mode={mode}
                    selectedEvent={selectedEvent}
                    onEventSelect={setSelectedEvent}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
