"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Onboarding from "./components/Onboarding";
import WhatsNew from "./components/WhatsNew";
import Navbart from "./components/Navbart";
import categorizeEvents from "./components/CategoriseEvents";
import AlternativeDrawer from "./components/AlternativeDrawer";
import { useMediaQuery } from "@/lib/use-media-query";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

import BottomAppBar from "./components/BottomBar";
import VerticalSlider from "./components/VerticalSlider";
import LeftDrawer from "./components/LeftDrawer";
import SettingsPanel from "./components/SettingsPanel";
import SettingsIcons from "./components/SettingsIcons";
import EventStats from "./components/EventStats";
import Pane from "./components/Pane";
import LoadingScreen from "./components/LoadingScreen";
import Bookmarks from "./components/Bookmarks";
import EventDetailModal from "./components/EventDetailModal";
import OnThisDay from "./components/OnThisDay";
import CommandPalette from "./components/CommandPalette";
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
  const [detailEvent, setDetailEvent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [isSlider, setIsSlider] = useState(false);
  const [country, setCountry] = useState();
  const [lightMode, setLightMode] = useState(false); // Default to dark mode
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("map"); // Default to map view
  const [isLoading, setIsLoading] = useState(true);
  
  // New states
  const [showTutorial, setShowTutorial] = useState(false);
  const [statsOpen, setStatsOpen] = useState(true); // Default to stats open
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [globeLoading, setGlobeLoading] = useState(false);
  const sharedEventIdRef = useRef(null);

  // Bookmarks — persisted in localStorage
  const [bookmarks, setBookmarks] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("gloria_bookmarks") || "[]");
      } catch { return []; }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("gloria_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = useCallback((eventId) => {
    setBookmarks((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  }, []);

  const isBookmarked = useCallback(
    (eventId) => bookmarks.includes(eventId),
    [bookmarks]
  );

  // Cmd+K command palette
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Share URL: read ?event= param on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("event");
    if (eventId) {
      // We'll try to select it once events load
      sharedEventIdRef.current = eventId;
    }
  }, []);

  // Apply shared event ID after events load
  useEffect(() => {
    if (events.length > 0 && sharedEventIdRef.current) {
      const shared = events.find((e) => e._id === sharedEventIdRef.current);
      if (shared) {
        setSelectedEvent(shared);
        setDetailEvent(shared);
      }
      sharedEventIdRef.current = null;
    }
  }, [events]);

  // Select an event: fly to it on map AND show the detail modal
  const handleEventSelect = useCallback((event) => {
    setSelectedEvent(event);
    setDetailEvent(event);
  }, []);

  // Surprise Me: fetch a random event from the API
  const handleSurpriseMe = useCallback(async () => {
    try {
      const res = await fetch('/api/events/random');
      if (!res.ok) return;
      const event = await res.json();
      if (event && event._id) {
        handleEventSelect(event);
      }
    } catch (err) {
      console.error('Surprise Me failed:', err);
    }
  }, [handleEventSelect]);

  // Toggle dark class on html element
  useEffect(() => {
    const html = document.documentElement;
    if (!lightMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [lightMode]);

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
      const params = new URLSearchParams({ page, limit, startYear, endYear });
      const response = await fetch(`/api/events/coordinates?${params}`);
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error("Error fetching events with coordinates:", error);
      return null;
    }
  };

  const isDark = !lightMode;

  return (
    <div className={`${isDark ? "dark" : ""}`}>
      <Onboarding
        forceOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
      <WhatsNew />

      {/* Event Detail Modal */}
      <EventDetailModal
        event={detailEvent}
        onClose={() => setDetailEvent(null)}
        lightMode={lightMode}
        isBookmarked={detailEvent ? isBookmarked(detailEvent._id) : false}
        toggleBookmark={toggleBookmark}
        onFlyToEvent={(e) => {
          setSelectedEvent(e);
          setDetailEvent(null);
        }}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        events={events}
        lightMode={lightMode}
        setLightMode={setLightMode}
        setSelectedEvent={handleEventSelect}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setSettingsOpen={setSettingsOpen}
        setStatsOpen={setStatsOpen}
        setLeftOpen={setLeftOpen}
        setBookmarksOpen={setBookmarksOpen}
      />

      {/* Bookmarks Panel */}
      <Bookmarks
        isOpen={bookmarksOpen}
        setIsOpen={setBookmarksOpen}
        lightMode={lightMode}
        events={events}
        bookmarks={bookmarks}
        toggleBookmark={toggleBookmark}
        onEventClick={handleEventSelect}
      />

      {/* On This Day Widget */}
      {!isLoading && isDesktop && (
        <OnThisDay
          lightMode={lightMode}
          onEventClick={handleEventSelect}
        />
      )}

      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && events.length === 0 && <LoadingScreen isDark={isDark} />}
      </AnimatePresence>

      {/* Mobile Vertical Slider (removed dead mobileSlider usage) */}

      {/* Mobile slider close button */}
      {!isDesktop && isSlider && (
        <div className="fixed z-[1030] bottom-[5vh] top-auto left-1/2 -translate-x-1/2">
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
          setLeftOpen={setLeftOpen}
          leftOpen={leftOpen}
          lightMode={lightMode}
          events={events}
          onEventClick={handleEventSelect}
        />

        <div
          className={`canvas flex flex-col relative transition-all h-full
           ${isDesktop && isOpen ? "max-w-[70%]" : "w-full"}
          `}
        >
          {/* Navbar / Bottom Bar */}
          {isDesktop ? (
            <div className="z-[1000]">
              <Navbart
                setSelectedEvent={handleEventSelect}
                leftOpen={leftOpen}
                setLeftOpen={setLeftOpen}
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                lightMode={lightMode}
                setLightMode={setLightMode}
                setCountry={setCountry}
                viewMode={viewMode}
                setViewMode={setViewMode}
                setGlobeLoading={setGlobeLoading}
                events={events}
              />
            </div>
          ) : (
            <BottomAppBar
              isSlider={isSlider}
              setLeftOpen={setLeftOpen}
              leftOpen={leftOpen}
              settingsOpen={settingsOpen}
              setSettingsOpen={setSettingsOpen}
              setIsSlider={setIsSlider}
              lightMode={lightMode}
              setLightMode={setLightMode}
              viewMode={viewMode}
              setViewMode={setViewMode}
              setGlobeLoading={setGlobeLoading}
              setBookmarksOpen={setBookmarksOpen}
              onSurpriseMe={handleSurpriseMe}
            />
          )}

          {/* Desktop Settings Icons (Floating Dock) */}
          {isDesktop && (
            <SettingsIcons
              setLeftOpen={setLeftOpen}
              leftOpen={leftOpen}
              setLightMode={setLightMode}
              lightMode={lightMode}
              setIsOpen={setIsOpen}
              isOpen={isOpen}
              setSettingsOpen={setSettingsOpen}
              settingsOpen={settingsOpen}
              setStatsOpen={setStatsOpen}
              setBookmarksOpen={setBookmarksOpen}
              setCommandPaletteOpen={setCommandPaletteOpen}
              onSurpriseMe={handleSurpriseMe}
            />
          )}

          {/* Settings Panel */}
          <div
            className={`absolute panel-cont transition-opacity duration-500 ease-in-out 
              ${settingsOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
              ${
                isDesktop
                  ? "right-20 top-20 z-[1030]"
                  : "fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/50"
              }`}
          >
            <SettingsPanel
              isDesktop={isDesktop}
              setSelectedEvent={setSelectedEvent}
              yearRange={yearRange}
              setLimit={setLimit}
              setSettingsOpen={setSettingsOpen}
              pages={pages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              limit={limit}
              filterTotalEvents={filterTotalEvents}
              totalEvents={totalEvents}
              setYearRange={setYearRange}
              selectedCategory={selectedCategory}
              country={country}
              setCountry={setCountry}
              setSelectedCategory={setSelectedCategory}
              lightMode={lightMode}
              onShowTutorial={() => setShowTutorial(true)}
            />
          </div>
          
           {/* Event Stats Panel */}
           <div className={`absolute top-20 right-5 z-[1030] hidden lg:block`}>
            <EventStats
              isOpen={statsOpen}
              onClose={() => setStatsOpen(false)}
              events={events}
              lightMode={lightMode}
            />
          </div>

          {/* Random Events Drawers */}
          {isDesktop ? (
            <Pane
              setIsOpen={setIsOpen}
              lightMode={lightMode}
              isOpen={isOpen}
              randomEvents={randomEvents}
              randomizeEvents={randomizeEvents}
              onEventClick={handleEventSelect}
            />
          ) : (
            <AlternativeDrawer
              events={randomEvents}
              lightMode={lightMode}
              onEventClick={handleEventSelect}
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
                    lightMode={lightMode}
                    selectedEvent={selectedEvent}
                    onEventSelect={handleEventSelect}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="globe"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full w-full relative"
                >
                  {globeLoading && (
                    <div 
                      className="absolute inset-0 z-10 flex items-center justify-center"
                      style={{
                        background: isDark 
                          ? "radial-gradient(ellipse at center, #0f1729 0%, #0a0c1a 70%, #050714 100%)" 
                          : "radial-gradient(ellipse at center, #f1f5f9 0%, #e2e8f0 70%, #cbd5e1 100%)",
                      }}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className={`w-12 h-12 rounded-full border-2 ${isDark ? "border-purple-500/30" : "border-purple-300/30"} border-t-purple-500`}
                        />
                        <span className={`text-sm font-medium ${isDark ? "text-white/60" : "text-gray-500"}`}>
                          Loading Globe...
                        </span>
                      </div>
                    </div>
                  )}
                  <GlobeComponent
                    events={events}
                    lightMode={lightMode}
                    selectedEvent={selectedEvent}
                    onEventSelect={handleEventSelect}
                    onLoad={() => setGlobeLoading(false)}
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
