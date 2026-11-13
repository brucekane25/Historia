"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Map, Menu, Search, X, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { wikiImage } from "@/lib/wiki-image";

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
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[1000] w-[96%] max-w-[980px]"
    >
      <div className="plate rounded-[3px] flex items-stretch overflow-visible">
        {/* Masthead: the wordmark sits behind a hairline, like a printed header. */}
        <div className="flex items-center gap-2.5 pl-4 pr-4 border-r border-hairline flex-shrink-0">
          <Globe className="w-4 h-4 text-cinnabar" strokeWidth={1.5} />
          <div className="leading-none hidden sm:block">
            <span className="font-display text-[15px] font-semibold uppercase tracking-[0.18em] text-parchment">
              Gloria
            </span>
            <span className="hidden sm:block eyebrow text-dim mt-1.5">
              An Atlas of History
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 relative flex items-center px-3 min-w-0" ref={searchRef}>
          <div className="relative flex items-center w-full">
            <Search
              className="absolute left-0 w-3.5 h-3.5 pointer-events-none text-dim"
              strokeWidth={1.5}
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
              className="w-full pl-6 pr-12 py-2.5 text-[13px] bg-transparent text-parchment placeholder:text-dim/70 outline-none focus:placeholder:text-dim/40 transition-colors"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowResults(false);
                }}
                className="absolute right-0 text-dim hover:text-cinnabar transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            ) : (
              <span className="absolute right-0 eyebrow text-dim/50 hidden md:block">
                Ctrl K
              </span>
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
                className="absolute top-full mt-2 left-0 right-0 rounded-[3px] overflow-hidden z-[1050] plate-strong"
              >
                {searchResults.length === 0 ? (
                  <div className="px-4 py-5 text-center">
                    <p className="eyebrow text-dim">
                      {isSearching ? "Searching the archive…" : "No entries found"}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto">
                    {searchResults.map((event, index) => (
                      <button
                        key={event._id}
                        onClick={() => handleResultClick(event)}
                        className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-parchment/5 ${
                          index > 0 ? "border-t border-hairline" : ""
                        }`}
                      >
                        {event.thumbnail && (
                          <img
                            src={wikiImage(event.thumbnail)}
                            alt=""
                            className="w-9 h-9 object-cover flex-shrink-0 border border-hairline"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium truncate text-parchment">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-mono tabular text-cinnabar">
                              {event.year ?? "—"}
                            </span>
                            <span className="eyebrow text-dim/70">
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

        {/* Actions */}
        <div className="flex items-center gap-2 pl-3 pr-3 border-l border-hairline flex-shrink-0">
          <button
            onClick={() => onViewChange(viewMode === "map" ? "globe" : "map")}
            className="flex items-center gap-1.5 rounded-[2px] border border-hairline px-3 py-1.5 eyebrow text-dim hover:text-parchment hover:border-hairline-strong transition-colors"
          >
            {viewMode === "map" ? (
              <>
                <Globe className="w-3.5 h-3.5" strokeWidth={1.5} /> Globe
              </>
            ) : (
              <>
                <Map className="w-3.5 h-3.5" strokeWidth={1.5} /> Map
              </>
            )}
          </button>

          <a
            href="https://github.com/brucekane25/Historia"
            target="_blank"
            rel="noopener noreferrer"
            title="Source"
            className="w-8 h-8 rounded-[2px] flex items-center justify-center text-dim hover:text-cinnabar transition-colors"
          >
            <Github className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbart;
