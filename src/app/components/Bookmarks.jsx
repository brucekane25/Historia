"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bookmark, Trash2, Sparkles, Loader2 } from "lucide-react";
import { CATEGORY_COLORS as categoryColors } from "@/lib/category-colors";
import { wikiImage } from "@/lib/wiki-image";


const Bookmarks = ({
    isOpen,
    setIsOpen,
    lightMode,
    events,
    bookmarks,
    toggleBookmark,
    onEventClick,
}) => {
    const isDark = !lightMode;
    const [fetchedEvents, setFetchedEvents] = useState([]);
    const [loadingSaved, setLoadingSaved] = useState(false);

    const missingIds = useMemo(() => {
        const loadedIds = new Set((events || []).map((event) => event._id));
        return (bookmarks || []).filter((id) => !loadedIds.has(id));
    }, [bookmarks, events]);
    const missingKey = missingIds.join(",");

    useEffect(() => {
        if (!isOpen || missingKey === "") {
            if (missingKey === "") setFetchedEvents([]);
            setLoadingSaved(false);
            return;
        }

        const controller = new AbortController();
        setLoadingSaved(true);

        const loadSavedEvents = async () => {
            try {
                const res = await fetch(
                    `/api/events/ids?ids=${encodeURIComponent(missingKey)}`,
                    { signal: controller.signal }
                );
                if (!res.ok) return;
                const data = await res.json();
                if (!controller.signal.aborted) {
                    setFetchedEvents(data.events || []);
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Failed to load bookmarked events:", error);
                }
            } finally {
                if (!controller.signal.aborted) setLoadingSaved(false);
            }
        };

        loadSavedEvents();
        return () => controller.abort();
    }, [isOpen, missingKey]);

    const bookmarkedEvents = useMemo(() => {
        const byId = new Map();
        [...fetchedEvents, ...(events || [])].forEach((event) => {
            byId.set(event._id, event);
        });
        return (bookmarks || []).map((id) => byId.get(id)).filter(Boolean);
    }, [bookmarks, events, fetchedEvents]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[1015]"
                    style={{ pointerEvents: "none" }}
                >
                    {/* Click outside to close */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                        onClick={() => setIsOpen(false)}
                        style={{ pointerEvents: "auto" }}
                    />
                    
                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.95 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-4 top-20 bottom-20 flex flex-col rounded-[4px] overflow-hidden"
                        style={{
                            width: "340px",
                            maxWidth: "calc(100vw - 32px)",
                            backgroundColor: "var(--plate)",
                            backdropFilter: "blur(24px)",
                            color: "var(--parchment)",
                            border: isDark
                                ? "1px solid color-mix(in srgb, var(--brass) 20%, transparent)"
                                : "1px solid color-mix(in srgb, var(--brass) 15%, transparent)",
                            boxShadow: isDark
                                ? "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px color-mix(in srgb, var(--brass) 10%, transparent)"
                                : "0 25px 50px -12px color-mix(in srgb, var(--parchment) 10%, transparent), 0 0 30px color-mix(in srgb, var(--brass) 8%, transparent)",
                            pointerEvents: "auto",
                        }}
                    >
                        {/* Gradient border */}
                        <div className="relative h-1 flex-shrink-0">
                            <div 
                                className="absolute inset-0"
                                style={{
                                    background: "linear-gradient(90deg, var(--cinnabar) 0%, color-mix(in srgb, var(--brass) 55%, transparent) 55%, transparent 100%)",
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmer 2s linear infinite',
                                }}
                            />
                        </div>
                    
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Sparkles className={`w-5 h-5 ${"text-brass"}`} />
                                <span className="text-lg font-bold">Bookmarks</span>
                                {bookmarkedEvents.length > 0 && (
                                    <span
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isDark
                                            ? "bg-brass/20 text-brass"
                                            : "bg-brass/12 text-brass"
                                            }`}
                                    >
                                        {bookmarkedEvents.length}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={`w-8 h-8 rounded-[3px] flex items-center justify-center transition-all hover:scale-105 ${isDark
                                    ? "text-parchment/40 hover:text-parchment hover:bg-parchment/10"
                                    : "text-dim hover:text-parchment hover:bg-ink/5"
                                    }`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-4 pb-4 overflow-y-auto flex-1">
                            {loadingSaved && bookmarkedEvents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 gap-3">
                                    <Loader2 className={`w-6 h-6 animate-spin ${"text-brass"}`} />
                                    <p className={`text-sm font-medium ${isDark ? "text-parchment/40" : "text-dim"}`}>
                                        Loading saved events…
                                    </p>
                                </div>
                            ) : bookmarkedEvents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 gap-3">
                                    <Bookmark
                                        className={`w-12 h-12 ${isDark ? "text-parchment/10" : "text-dim"}`}
                                    />
                                    <p className={`text-sm font-medium ${isDark ? "text-parchment/30" : "text-dim"}`}>
                                        No bookmarks yet
                                    </p>
                                    <p className={`text-xs text-center ${isDark ? "text-parchment/20" : "text-dim"}`}>
                                        Click the bookmark button on any event to save it
                                    </p>
                                </div>
                            ) : (
                                <ul className="space-y-3">
                                    {bookmarkedEvents.map((event) => {
                                        const catColor = categoryColors[event.category] || "var(--parchment-dim)";
                                        return (
                                            <li
                                                key={event._id}
                                                className="rounded-[3px] p-3 cursor-pointer group relative transition-all hover:scale-[1.01] hover:shadow-lg"
                                                style={{
                                                    background: isDark
                                                        ? "color-mix(in srgb, var(--parchment) 4%, transparent)"
                                                        : "color-mix(in srgb, var(--parchment) 2%, transparent)",
                                                    border: isDark
                                                        ? "1px solid color-mix(in srgb, var(--parchment) 6%, transparent)"
                                                        : "1px solid color-mix(in srgb, var(--parchment) 5%, transparent)",
                                                }}
                                                onClick={() => {
                                                    onEventClick(event);
                                                    setIsOpen(false);
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Thumbnail */}
                                                    <div
                                                        className={`h-14 w-14 rounded-[3px] flex-shrink-0 overflow-hidden ${!event.thumbnail
                                                            ? isDark ? "bg-parchment/5" : "bg-muted"
                                                            : ""
                                                            }`}
                                                    >
                                                        {event.thumbnail && (
                                                            <img
                                                                src={wikiImage(event.thumbnail)}
                                                                alt={event.title}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="flex-grow min-w-0">
                                                        <h3 className={`text-sm font-semibold line-clamp-2 ${"text-parchment"}`}>
                                                            {event.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-xs font-bold ${"text-cinnabar"}`}>
                                                                {event.year ?? "—"}
                                                            </span>
                                                            <span
                                                                className="text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize"
                                                                style={{
                                                                    backgroundColor: catColor + "20",
                                                                    color: catColor,
                                                                }}
                                                            >
                                                                {event.category}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Remove bookmark */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleBookmark(event._id);
                                                        }}
                                                        className={`opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all w-8 h-8 rounded-[3px] flex items-center justify-center flex-shrink-0 hover:scale-105 ${isDark
                                                            ? "text-parchment/40 hover:text-cinnabar hover:bg-cinnabar/10"
                                                            : "text-dim hover:text-cinnabar hover:bg-cinnabar/12"
                                                            }`}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Bookmarks;
