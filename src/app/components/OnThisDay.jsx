"use client";
import React, { useState, useEffect } from "react";
import { Calendar, ChevronRight, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { wikiImage } from "@/lib/wiki-image";

const OnThisDay = ({ lightMode, onEventClick }) => {
    const isDark = !lightMode;
    const [visible, setVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [todayEvents, setTodayEvents] = useState([]);
    const [dateLabel, setDateLabel] = useState("");

    // Fetch from API
    useEffect(() => {
        const fetchToday = async () => {
            try {
                const res = await fetch("/api/events/today");
                if (!res.ok) return;
                const data = await res.json();
                setTodayEvents(data.events || []);
                setDateLabel(data.date || "");
            } catch (err) {
                console.error("Failed to fetch today events:", err);
            }
        };
        fetchToday();
    }, []);

    // Show widget after a short delay if there are matching events
    useEffect(() => {
        if (todayEvents.length > 0) {
            const dismissed = sessionStorage.getItem("gloria_otd_dismissed");
            if (!dismissed) {
                const timer = setTimeout(() => setVisible(true), 1500);
                return () => clearTimeout(timer);
            }
        }
    }, [todayEvents]);

    const handleDismiss = () => {
        setVisible(false);
        sessionStorage.setItem("gloria_otd_dismissed", "true");
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % todayEvents.length);
    };

    if (todayEvents.length === 0) return null;

    const event = todayEvents[currentIndex];

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed top-20 left-4 z-[1010] max-w-[320px]"
                >
                    <div
                        className={`rounded-[4px] shadow-2xl overflow-hidden ${isDark ? "shadow-cinnabar/5" : "shadow-black/10"
                            }`}
                        style={{
                            background: "var(--plate)",
                            backdropFilter: "blur(20px)",
                            border: isDark
                                ? "1px solid color-mix(in srgb, var(--parchment) 8%, transparent)"
                                : "1px solid color-mix(in srgb, var(--parchment) 6%, transparent)",
                            color: "var(--parchment)",
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 pt-3 pb-1">
                            <div className="flex items-center gap-2">
                                <Calendar
                                    className={`w-4 h-4 ${"text-cinnabar"
                                        }`}
                                />
                                <span
                                    className={`text-xs font-semibold ${"text-cinnabar"
                                        }`}
                                >
                                    On This Day — {dateLabel}
                                </span>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isDark
                                    ? "text-parchment/30 hover:text-parchment hover:bg-parchment/10"
                                    : "text-dim hover:text-parchment hover:bg-ink/5"
                                    }`}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Event Card */}
                        <div className="px-4 pb-3 pt-1">
                            <div className="flex items-start gap-3">
                                {event.thumbnail && (
                                    <img
                                        src={wikiImage(event.thumbnail)}
                                        alt=""
                                        className="w-12 h-12 rounded-[3px] object-cover flex-shrink-0"
                                        onError={(e) => { e.target.style.display = "none"; }}
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={`text-sm font-medium line-clamp-2 leading-snug ${"text-parchment"
                                            }`}
                                    >
                                        {event.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`text-xs font-bold ${"text-cinnabar"
                                                }`}
                                        >
                                            {event.year ?? "—"}
                                        </span>
                                        <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark
                                                ? "bg-parchment/10 text-parchment/50"
                                                : "bg-muted text-dim"
                                                }`}
                                        >
                                            {event.category}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-3">
                                <button
                                    onClick={() => {
                                        onEventClick(event);
                                        handleDismiss();
                                    }}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[3px] text-xs font-medium transition-all ${isDark
                                        ? "bg-cinnabar/15 text-cinnabar hover:bg-cinnabar/25"
                                        : "bg-cinnabar/12 text-cinnabar hover:bg-cinnabar/12"
                                        }`}
                                >
                                    <MapPin className="w-3 h-3" />
                                    View
                                </button>
                                {todayEvents.length > 1 && (
                                    <button
                                        onClick={handleNext}
                                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[3px] text-xs font-medium transition-all ${isDark
                                            ? "bg-parchment/5 text-parchment/50 hover:bg-parchment/10 hover:text-parchment"
                                            : "bg-ink/5 text-dim hover:bg-ink/10 hover:text-parchment"
                                            }`}
                                    >
                                        Next <ChevronRight className="w-3 h-3" />
                                    </button>
                                )}
                                <span
                                    className={`text-[10px] ml-auto ${isDark ? "text-parchment/20" : "text-dim"
                                        }`}
                                >
                                    {currentIndex + 1}/{todayEvents.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OnThisDay;
