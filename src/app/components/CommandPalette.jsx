"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
    Search,
    Globe,
    Map,
    Moon,
    Sun,
    Settings,
    BarChart3,
    LineChart,
    Bookmark,
    Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CommandPalette = ({
    isOpen,
    onClose,
    events,
    lightMode,
    setLightMode,
    setSelectedEvent,
    viewMode,
    setViewMode,
    setSettingsOpen,
    setStatsOpen,
    setLeftOpen,
    setBookmarksOpen,
}) => {
    const isDark = !lightMode;
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Actions
    const actions = useMemo(
        () => [
            {
                id: "toggle-dark",
                label: lightMode ? "Switch to Dark Mode" : "Switch to Light Mode",
                icon: lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
                action: () => setLightMode(!lightMode),
                group: "Actions",
            },
            {
                id: "toggle-view",
                label: viewMode === "map" ? "Switch to Globe View" : "Switch to Map View",
                icon:
                    viewMode === "map" ? (
                        <Globe className="w-4 h-4" />
                    ) : (
                        <Map className="w-4 h-4" />
                    ),
                action: () => setViewMode(viewMode === "map" ? "globe" : "map"),
                group: "Actions",
            },
            {
                id: "open-stats",
                label: "Open Stats Panel",
                icon: <BarChart3 className="w-4 h-4" />,
                action: () => setStatsOpen(true),
                group: "Actions",
            },
            {
                id: "open-timeline",
                label: "Open Timeline",
                icon: <LineChart className="w-4 h-4" />,
                action: () => setLeftOpen(true),
                group: "Actions",
            },
            {
                id: "open-settings",
                label: "Open Tweaks Panel",
                icon: <Settings className="w-4 h-4" />,
                action: () => setSettingsOpen(true),
                group: "Actions",
            },
            {
                id: "open-bookmarks",
                label: "Open Bookmarks",
                icon: <Bookmark className="w-4 h-4" />,
                action: () => setBookmarksOpen(true),
                group: "Actions",
            },
        ],
        [lightMode, viewMode, setLightMode, setViewMode, setSettingsOpen, setStatsOpen, setLeftOpen, setBookmarksOpen]
    );

    // Search results
    const results = useMemo(() => {
        const q = query.toLowerCase().trim();
        if (!q) return { events: [], actions };

        const filteredActions = actions.filter((a) =>
            a.label.toLowerCase().includes(q)
        );

        const filteredEvents = (events || [])
            .filter((e) => e.title?.toLowerCase().includes(q))
            .slice(0, 10)
            .map((e) => ({
                id: e._id,
                label: e.title,
                sublabel: `${e.year} · ${e.category}`,
                thumbnail: e.thumbnail,
                action: () => setSelectedEvent(e),
                group: "Events",
            }));

        return { events: filteredEvents, actions: filteredActions };
    }, [query, events, actions, setSelectedEvent]);

    const allItems = [...results.actions, ...results.events];

    // Keyboard nav
    const handleKeyDown = useCallback(
        (e) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (allItems[selectedIndex]) {
                    allItems[selectedIndex].action();
                    onClose();
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        },
        [allItems, selectedIndex, onClose]
    );

    // Scroll selected item into view
    useEffect(() => {
        const el = listRef.current?.children[selectedIndex];
        if (el) el.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    // Reset selection when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[1040] flex items-start justify-center pt-[15vh]"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: isDark
                            ? "rgba(0,0,0,0.6)"
                            : "rgba(0,0,0,0.3)",
                        backdropFilter: "blur(4px)",
                    }}
                />

                {/* Palette */}
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="relative w-full max-w-[520px] mx-4 rounded-2xl shadow-2xl overflow-hidden"
                    style={{
                        background: isDark
                            ? "rgba(15,17,30,0.97)"
                            : "rgba(255,255,255,0.97)",
                        backdropFilter: "blur(24px)",
                        border: isDark
                            ? "1px solid rgba(255,255,255,0.1)"
                            : "1px solid rgba(0,0,0,0.08)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Search Input */}
                    <div
                        className="flex items-center gap-3 px-4 py-3"
                        style={{
                            borderBottom: isDark
                                ? "1px solid rgba(255,255,255,0.06)"
                                : "1px solid rgba(0,0,0,0.06)",
                        }}
                    >
                        <Search
                            className={`w-4.5 h-4.5 flex-shrink-0 ${isDark ? "text-purple-400" : "text-purple-600"
                                }`}
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search events, actions..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={`flex-1 bg-transparent border-0 outline-none text-sm ${isDark
                                ? "text-white placeholder:text-white/30"
                                : "text-gray-900 placeholder:text-gray-400"
                                }`}
                        />
                        <kbd
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isDark
                                ? "bg-white/5 text-white/30"
                                : "bg-black/5 text-gray-400"
                                }`}
                        >
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div
                        ref={listRef}
                        className="max-h-[320px] overflow-y-auto py-1"
                    >
                        {allItems.length === 0 && query && (
                            <div className="px-4 py-8 text-center">
                                <p
                                    className={`text-sm ${isDark ? "text-white/30" : "text-gray-400"
                                        }`}
                                >
                                    No results for &ldquo;{query}&rdquo;
                                </p>
                            </div>
                        )}

                        {/* Show group headers */}
                        {results.actions.length > 0 && (
                            <div
                                className={`px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-white/25" : "text-gray-400"
                                    }`}
                            >
                                Actions
                            </div>
                        )}
                        {results.actions.map((item, i) => {
                            const globalIndex = i;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        item.action();
                                        onClose();
                                    }}
                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${selectedIndex === globalIndex
                                        ? isDark
                                            ? "bg-white/5"
                                            : "bg-black/3"
                                        : ""
                                        }`}
                                >
                                    <span
                                        className={`flex-shrink-0 ${isDark ? "text-purple-400" : "text-purple-600"
                                            }`}
                                    >
                                        {item.icon}
                                    </span>
                                    <span
                                        className={`text-sm ${isDark ? "text-white/80" : "text-gray-700"
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}

                        {results.events.length > 0 && (
                            <div
                                className={`px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-white/25" : "text-gray-400"
                                    }`}
                            >
                                Events
                            </div>
                        )}
                        {results.events.map((item, i) => {
                            const globalIndex = results.actions.length + i;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        item.action();
                                        onClose();
                                    }}
                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                    className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${selectedIndex === globalIndex
                                        ? isDark
                                            ? "bg-white/5"
                                            : "bg-black/3"
                                        : ""
                                        }`}
                                >
                                    {item.thumbnail && (
                                        <img
                                            src={item.thumbnail}
                                            alt=""
                                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={`text-sm truncate ${isDark ? "text-white/80" : "text-gray-700"
                                                }`}
                                        >
                                            {item.label}
                                        </p>
                                        <p
                                            className={`text-[10px] ${isDark ? "text-white/30" : "text-gray-400"
                                                }`}
                                        >
                                            {item.sublabel}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div
                        className="flex items-center justify-between px-4 py-2"
                        style={{
                            borderTop: isDark
                                ? "1px solid rgba(255,255,255,0.06)"
                                : "1px solid rgba(0,0,0,0.06)",
                        }}
                    >
                        <div
                            className={`flex items-center gap-1.5 text-[10px] ${isDark ? "text-white/20" : "text-gray-400"
                                }`}
                        >
                            <Command className="w-3 h-3" />
                            <span>K to open</span>
                        </div>
                        <div
                            className={`flex items-center gap-3 text-[10px] ${isDark ? "text-white/20" : "text-gray-400"
                                }`}
                        >
                            <span>↑↓ navigate</span>
                            <span>↵ select</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CommandPalette;
