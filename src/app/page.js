"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Onboarding from "./components/Onboarding";
import WhatsNew from "./components/WhatsNew";
import Navbart from "./components/Navbart";
import categorizeEvents from "./components/CategoriseEvents";
import AlternativeDrawer from "./components/AlternativeDrawer";
import { useMediaQuery } from "@/lib/use-media-query";
import { FULL_YEAR_RANGE } from "@/lib/history-range";
import { Button } from "@/components/ui/button";
import { ArrowDown, Search } from "lucide-react";

import BottomAppBar from "./components/BottomBar";
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

// These database categories survive client-side topic classification unchanged,
// so filtering them can happen across the whole archive instead of only the
// currently loaded page. Generic "events" rows are reclassified into topics.
const SERVER_FILTERABLE_CATEGORIES = new Set([
  "selected",
  "holidays",
  "births",
  "deaths",
]);

export default function Home() {
  const [events, setEvents] = useState([]);
  const [categorizedEvents, setCategorizedEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(2200);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [randomEvents, setRandomEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [filterTotalEvents, setFilterTotalEvents] = useState(null);
  const [yearRange, setYearRange] = useState(() => ({ ...FULL_YEAR_RANGE }));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [isSlider, setIsSlider] = useState(false);
  const [lightMode, setLightMode] = useState(false); // Default to dark mode
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("map"); // Default to map view
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [skipCategoryFilter, setSkipCategoryFilter] = useState(false);

  const serverCategoryQuery =
    selectedCategory.length > 0 &&
    selectedCategory.every((category) =>
      SERVER_FILTERABLE_CATEGORIES.has(category)
    )
      ? selectedCategory.join(",")
      : "";
  const serverCategoryQueryRef = useRef("");
  serverCategoryQueryRef.current = serverCategoryQuery;
  
  // New states
  const [showTutorial, setShowTutorial] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false); // Keep the map/globe unobstructed by default
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [globeLoading, setGlobeLoading] = useState(false);

  // Bookmarks — persisted in localStorage after hydration.
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("gloria_bookmarks") || "[]");
      if (Array.isArray(stored)) setBookmarks(stored);
    } catch {
      // Ignore malformed storage and start with an empty list.
    }
    setBookmarksLoaded(true);
  }, []);

  useEffect(() => {
    if (bookmarksLoaded) {
      localStorage.setItem("gloria_bookmarks", JSON.stringify(bookmarks));
    }
  }, [bookmarks, bookmarksLoaded]);

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

  // Share URL: load the event by ID so links work even outside the current page.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("event");
    if (!eventId) return;

    const controller = new AbortController();

    const loadSharedEvent = async () => {
      try {
        const res = await fetch(`/api/events/id/${eventId}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const event = await res.json();
        if (event?._id) {
          setSelectedEvent(event);
          setDetailEvent(event);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to load shared event:", err);
        }
      }
    };

    loadSharedEvent();
    return () => controller.abort();
  }, []);

  // Select an event: fly to it on map AND show the detail modal
  const handleEventSelect = useCallback((event) => {
    setSelectedEvent(event);
    setDetailEvent(event);
  }, []);

  const handleViewChange = useCallback(
    (nextView) => {
      if (nextView === "globe" && viewMode !== "globe") {
        setGlobeLoading(true);
      }
      if (nextView === "map") {
        setGlobeLoading(false);
      }
      setViewMode(nextView);
    },
    [viewMode]
  );

  const handleLimitChange = useCallback((value) => {
    setCurrentPage(1);
    setLimit(value);
  }, []);

  const handleYearRangeChange = useCallback((nextRange) => {
    setCurrentPage(1);
    setYearRange(nextRange);
    setSelectedEvent(null);
    setDetailEvent(null);
  }, []);

  const handleCategoryChange = useCallback((categories) => {
    const nextServerQuery =
      categories.length > 0 &&
      categories.every((category) => SERVER_FILTERABLE_CATEGORIES.has(category))
        ? categories.join(",")
        : "";

    // Archive-backed filters need a request. Keep the current map visible
    // until that response arrives instead of flashing an empty view.
    setSkipCategoryFilter(
      Boolean(nextServerQuery) &&
        nextServerQuery !== serverCategoryQueryRef.current
    );
    setCurrentPage(1);
    setSelectedCategory(categories);
    setSelectedEvent(null);
    setDetailEvent(null);
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
    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await fetchEventsWithCoordinates(
          currentPage,
          limit,
          yearRange.startYear,
          yearRange.endYear,
          serverCategoryQuery,
          controller.signal
        );

        if (controller.signal.aborted) return;

        if (!data) {
          setLoadError("Could not load events. Check the connection and try again.");
          return;
        }

        const totalPages = Math.max(1, data.totalPages || 1);
        if (currentPage > totalPages) {
          setSkipCategoryFilter(false);
          setCurrentPage(totalPages);
          return;
        }

        const categorized = await categorizeEvents(data.events);

        setCategorizedEvents(categorized);
        setPages(totalPages);
        setTotalEvents(data.totalEvents);
        setSkipCategoryFilter(false);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error loading events:", error);
          setLoadError("Could not load events. Check the connection and try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setSkipCategoryFilter(false);
        }
      }
    };

    fetchData();
    setSelectedEvent(null);

    return () => controller.abort();
  }, [currentPage, yearRange, limit, retryCount, serverCategoryQuery]);

  // Category filtering is instant for loaded events. While an archive-backed
  // category request is in flight, keep the current map visible instead of
  // blanking it out.
  useEffect(() => {
    if (skipCategoryFilter) return;

    const filtered =
      selectedCategory.length > 0
        ? categorizedEvents.filter((event) =>
            selectedCategory.includes(event.category)
          )
        : categorizedEvents;

    setEvents(filtered);
    setFilterTotalEvents(filtered.length);
  }, [categorizedEvents, selectedCategory, skipCategoryFilter]);

  const fetchEventsWithCoordinates = async (
    page,
    limit,
    startYear,
    endYear,
    category,
    signal
  ) => {
    try {
      const params = new URLSearchParams({ page, limit, startYear, endYear });
      if (category) params.set("category", category);
      const response = await fetch(`/api/events/coordinates?${params}`, {
        signal,
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (error.name === "AbortError") throw error;
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
        lightMode={lightMode}
      />
      <WhatsNew lightMode={lightMode} />

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
          handleViewChange("map");
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
        onViewChange={handleViewChange}
        setSettingsOpen={setSettingsOpen}
        setStatsOpen={setStatsOpen}
        setLeftOpen={setLeftOpen}
        setBookmarksOpen={setBookmarksOpen}
        onSurpriseMe={handleSurpriseMe}
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
      {!isLoading && isDesktop && viewMode === "map" && (
        <OnThisDay
          lightMode={lightMode}
          onEventClick={handleEventSelect}
        />
      )}

      {/* Loading Screen */}
      <AnimatePresence>
        {isLoading && events.length === 0 && <LoadingScreen lightMode={lightMode} />}
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
                viewMode={viewMode}
                onViewChange={handleViewChange}
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
              onViewChange={handleViewChange}
              setBookmarksOpen={setBookmarksOpen}
              bookmarksOpen={bookmarksOpen}
              setCommandPaletteOpen={setCommandPaletteOpen}
              onSurpriseMe={handleSurpriseMe}
            />
          )}

          {/* Mobile search — the navbar is desktop-only. */}
          {!isDesktop && (
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              title="Search events"
              aria-label="Search events"
              className={`fixed left-4 top-4 z-[1025] flex h-10 w-10 items-center justify-center rounded-xl shadow-2xl backdrop-blur-xl transition-transform hover:scale-105 ${
                isDark
                  ? "glass-dark text-white/65 hover:text-white"
                  : "glass text-gray-600 hover:text-gray-900"
              }`}
              style={{
                border: isDark
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <Search className="h-4 w-4" />
            </button>
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
            aria-hidden={!settingsOpen}
            inert={settingsOpen ? undefined : true}
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
              setLimit={handleLimitChange}
              setSettingsOpen={setSettingsOpen}
              pages={pages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              limit={limit}
              filterTotalEvents={filterTotalEvents}
              totalEvents={totalEvents}
              isLoading={isLoading}
              setYearRange={handleYearRangeChange}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
              lightMode={lightMode}
              onShowTutorial={() => setShowTutorial(true)}
            />
          </div>
          
           {/* Event Stats Panel */}
           <EventStats
              isOpen={statsOpen}
              onClose={() => setStatsOpen(false)}
              events={events}
              lightMode={lightMode}
            />

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
            {loadError && (
              <div className="pointer-events-none absolute inset-x-4 top-24 z-[1005] flex justify-center px-2">
                <div
                  className={`pointer-events-auto flex max-w-lg items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${
                    isDark
                      ? "border border-red-400/20 bg-[#170d14]/95 text-red-100"
                      : "border border-red-200 bg-white/95 text-red-700"
                  }`}
                >
                  <span className="min-w-0 flex-1">{loadError}</span>
                  <Button
                    size="sm"
                    onClick={() => setRetryCount((value) => value + 1)}
                    className="shrink-0 rounded-xl bg-red-500 text-white hover:bg-red-400"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}
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
