"use client";
import React, { useState, useEffect } from "react";
import { Calendar, ChevronRight, X, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
                const timer = setTimeout(() => setVisible(true), 2500);
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
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed bottom-6 left-6 z-[1010] max-w-[320px]"
                >
                    <div
                        className={`rounded-2xl shadow-2xl overflow-hidden ${isDark ? "shadow-purple-500/5" : "shadow-black/10"
                            }`}
                        style={{
                            background: isDark
                                ? "rgba(15,17,30,0.95)"
                                : "rgba(255,255,255,0.95)",
                            backdropFilter: "blur(20px)",
                            border: isDark
                                ? "1px solid rgba(255,255,255,0.08)"
                                : "1px solid rgba(0,0,0,0.06)",
                            color: isDark ? "#e5e7eb" : "#111827",
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 pt-3 pb-1">
                            <div className="flex items-center gap-2">
                                <Calendar
                                    className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"
                                        }`}
                                />
                                <span
                                    className={`text-xs font-semibold ${isDark ? "text-purple-400" : "text-purple-600"
                                        }`}
                                >
                                    On This Day — {dateLabel}
                                </span>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isDark
                                    ? "text-white/30 hover:text-white hover:bg-white/10"
                                    : "text-gray-400 hover:text-gray-900 hover:bg-black/5"
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
                                        src={event.thumbnail}
                                        alt=""
                                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                        onError={(e) => { e.target.style.display = "none"; }}
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p
                                        className={`text-sm font-medium line-clamp-2 leading-snug ${isDark ? "text-white" : "text-gray-900"
                                            }`}
                                    >
                                        {event.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className={`text-xs font-bold ${isDark ? "text-purple-400" : "text-purple-600"
                                                }`}
                                        >
                                            {event.year}
                                        </span>
                                        <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark
                                                ? "bg-white/10 text-white/50"
                                                : "bg-gray-100 text-gray-500"
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
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${isDark
                                        ? "bg-purple-500/15 text-purple-300 hover:bg-purple-500/25"
                                        : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                                        }`}
                                >
                                    <MapPin className="w-3 h-3" />
                                    View
                                </button>
                                {todayEvents.length > 1 && (
                                    <button
                                        onClick={handleNext}
                                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${isDark
                                            ? "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                                            : "bg-black/5 text-gray-500 hover:bg-black/10 hover:text-gray-900"
                                            }`}
                                    >
                                        Next <ChevronRight className="w-3 h-3" />
                                    </button>
                                )}
                                <span
                                    className={`text-[10px] ml-auto ${isDark ? "text-white/20" : "text-gray-300"
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
