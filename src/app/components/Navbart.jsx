"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Map, Menu, Search, X, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function titleRelevance(title, query) {
  const text = (title || "").toLowerCase();
  if (!text) return 0;
  let score = 0;
  if (text.startsWith(query)) score += 40;
  const index = text.indexOf(query);
  if (index === 0) score += 10;
  else if (index > 0) score += 4;
  score += Math.max(0, 10 - Math.floor(text.length / 30));
  return score;
}

const Navbart = ({
  setSelectedEvent,
  leftOpen,
  setLeftOpen,
  lightMode,
  setLightMode,
  viewMode,
  onViewChange,
  events,
}) => {
  const isDark = !lightMode;
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [remoteResults, setRemoteResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Instant matches from the events already on the map.
  const localResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return (events || [])
      .filter((e) => e.title?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery, events]);

  // Debounced full-database search so older events are findable too.
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setRemoteResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    setRemoteResults([]);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/events/search/${encodeURIComponent(query)}?limit=8`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          if (!controller.signal.aborted) {
            setRemoteResults(Array.isArray(data) ? data : data.events || []);
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Search failed:", err);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const seen = new Set();
    return [...localResults, ...remoteResults]
      .filter((event) => {
        if (!event?._id || seen.has(event._id)) return false;
        seen.add(event._id);
        return true;
      })
      .sort(
        (a, b) =>
          titleRelevance(b.title, query) - titleRelevance(a.title, query) ||
          (b.year || 0) - (a.year || 0)
      )
      .slice(0, 8);
  }, [localResults, remoteResults, searchQuery]);

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
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchResults[0]) {
                  e.preventDefault();
                  handleResultClick(searchResults[0]);
                } else if (e.key === "Escape") {
                  setShowResults(false);
                }
              }}
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
            {showResults && searchQuery.trim().length >= 2 && (
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
                {searchResults.length === 0 ? (
                  <div
                    className={`px-4 py-5 text-center text-xs ${
                      isDark ? "text-white/35" : "text-gray-400"
                    }`}
                  >
                    {isSearching ? "Searching…" : "No events found."}
                  </div>
                ) : (
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
                            {event.year ?? "—"}
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
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View Toggle */}
        <button
          onClick={() => onViewChange(viewMode === "map" ? "globe" : "map")}
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
          href="https://github.com/brucekane25/Historia"
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
