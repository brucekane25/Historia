"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Map, Menu, Search, X, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbart = ({
  setSelectedEvent,
  leftOpen,
  setLeftOpen,
  lightMode,
  setLightMode,
  viewMode,
  setViewMode,
  events,
  setCountry,
}) => {
  const isDark = !lightMode;
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Client-side search
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return (events || [])
      .filter((e) => e.title?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery, events]);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleResultClick = (event) => {
    setSelectedEvent(event);
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] w-[95%] max-w-[900px]"
    >
      <div
        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-2xl ${isDark
          ? "glass-dark shadow-purple-500/5"
          : "glass shadow-black/10"
          }`}
        style={{
          border: isDark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark
              ? "bg-purple-500/20 text-purple-300"
              : "bg-purple-100 text-purple-600"
              }`}
          >
            <Globe className="w-4 h-4" />
          </div>
          <span
            className={`font-bold text-sm hidden sm:block ${isDark ? "text-white" : "text-gray-900"
              }`}
          >
            Gloria
          </span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded-full hidden sm:block ${isDark
              ? "bg-white/5 text-white/30"
              : "bg-black/5 text-gray-400"
              }`}
          >
            v3
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 relative" ref={searchRef}>
          <div className="relative">
            <Search
              className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? "text-white/30" : "text-gray-400"
                }`}
            />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className={`w-full pl-8 pr-8 py-1.5 text-xs rounded-xl border-0 outline-none transition-colors ${isDark
                ? "bg-white/5 text-white placeholder:text-white/25 focus:bg-white/10"
                : "bg-black/5 text-gray-900 placeholder:text-gray-400 focus:bg-black/8"
                }`}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowResults(false);
                }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${isDark ? "text-white/30 hover:text-white" : "text-gray-400 hover:text-gray-900"
                  }`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 left-0 right-0 rounded-xl shadow-2xl overflow-hidden z-[1050]"
                style={{
                  background: isDark
                    ? "rgba(15,17,30,0.97)"
                    : "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(20px)",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <div className="max-h-[300px] overflow-y-auto py-1">
                  {searchResults.map((event) => (
                    <button
                      key={event._id}
                      onClick={() => handleResultClick(event)}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors ${isDark
                        ? "hover:bg-white/5"
                        : "hover:bg-black/3"
                        }`}
                    >
                      {event.thumbnail && (
                        <img
                          src={event.thumbnail}
                          alt=""
                          className="w-8 h-8 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-medium truncate ${isDark ? "text-white" : "text-gray-900"
                            }`}
                        >
                          {event.title}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono ${isDark ? "text-purple-400" : "text-purple-600"
                              }`}
                          >
                            {event.year}
                          </span>
                          <span
                            className={`text-[9px] ${isDark ? "text-white/30" : "text-gray-400"
                              }`}
                          >
                            {event.category}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View Toggle */}
        <button
          onClick={() => setViewMode(viewMode === "map" ? "globe" : "map")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${isDark
            ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            : "bg-black/5 text-gray-600 hover:bg-black/10 hover:text-gray-900"
            }`}
        >
          {viewMode === "map" ? (
            <>
              <Globe className="w-3.5 h-3.5" /> Globe
            </>
          ) : (
            <>
              <Map className="w-3.5 h-3.5" /> Map
            </>
          )}
        </button>

        {/* GitHub */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isDark
            ? "text-white/40 hover:text-white hover:bg-white/10"
            : "text-gray-400 hover:text-gray-900 hover:bg-black/5"
            }`}
        >
          <Github className="w-4 h-4" />
        </a>
      </div>
    </motion.nav>
  );
};

export default Navbart;
