"use client";
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    X,
    Bookmark,
    BookmarkCheck,
    Share2,
    ExternalLink,
    MapPin,
    Calendar,
    Tag,
    Check,
    Copy,
    Loader2,
    Clock,
    Navigation,
    Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categoryColors = {
    war: "#ef4444",
    political: "#8b5cf6",
    cultural: "#f59e0b",
    scientific: "#10b981",
    religious: "#eab308",
    disasters: "#f97316",
    discoveries: "#3b82f6",
    historical: "#ec4899",
    economic: "#14b8a6",
    social: "#f43f5e",
    births: "#a78bfa",
    deaths: "#6b7280",
    events: "#22d3ee",
    environmental: "#22c55e",
};

const EventDetailModal = ({
    event,
    onClose,
    lightMode,
    isBookmarked,
    toggleBookmark,
    onFlyToEvent,
}) => {
    const isDark = !lightMode;
    const [copied, setCopied] = useState(false);
    const [relatedEvents, setRelatedEvents] = useState([]);
    const [nearbyEvents, setNearbyEvents] = useState([]);
    const [loadingRelated, setLoadingRelated] = useState(false);
    const [loadingNearby, setLoadingNearby] = useState(false);

    // Fetch related and nearby events when event changes
    useEffect(() => {
        if (!event?._id) {
            setRelatedEvents([]);
            setNearbyEvents([]);
            return;
        }

        // Fetch related events
        const fetchRelated = async () => {
            setLoadingRelated(true);
            try {
                const res = await fetch(`/api/events/related/${event._id}`);
                if (res.ok) {
                    const data = await res.json();
                    setRelatedEvents(data.related || []);
                }
            } catch (err) {
                console.error('Failed to fetch related events:', err);
            }
            setLoadingRelated(false);
        };

        // Fetch nearby events
        const fetchNearby = async () => {
            if (!event.coordinates) {
                setNearbyEvents([]);
                return;
            }
            setLoadingNearby(true);
            try {
                const params = new URLSearchParams({
                    lat: event.coordinates.lat,
                    lon: event.coordinates.lon,
                    radius: '5',
                    excludeId: event._id,
                });
                const res = await fetch(`/api/events/nearby?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    setNearbyEvents(data.events || []);
                }
            } catch (err) {
                console.error('Failed to fetch nearby events:', err);
            }
            setLoadingNearby(false);
        };

        fetchRelated();
        fetchNearby();
    }, [event?._id]);

    if (!event) return null;

    const catColor = categoryColors[event.category] || "#6b7280";

    const handleShare = async () => {
        const url = `${window.location.origin}?event=${event._id}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textarea = document.createElement("textarea");
            textarea.value = url;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleEventCardClick = (e) => {
        onFlyToEvent?.(e);
        onClose();
    };

    return (
        <Dialog open={!!event} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent
                className="sm:max-w-[560px] p-0 overflow-hidden border-0 z-[1040]"
                style={{
                    background: isDark
                        ? "rgba(15,17,30,0.95)"
                        : "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(24px)",
                    border: isDark
                        ? "1px solid rgba(139,92,246,0.2)"
                        : "1px solid rgba(139,92,246,0.15)",
                    color: isDark ? "#e5e7eb" : "#111827",
                    maxHeight: "88vh",
                    boxShadow: isDark
                        ? "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 80px rgba(139,92,246,0.15)"
                        : "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 40px rgba(139,92,246,0.1)",
                }}
            >
                <DialogTitle className="sr-only">{event.title}</DialogTitle>
                <div className="overflow-y-auto max-h-[88vh]">
                    {/* Animated gradient border top */}
                    <div className="relative h-1">
                        <div 
                            className="absolute inset-0 opacity-80"
                            style={{
                                background: `linear-gradient(90deg, ${catColor}, transparent, ${catColor})`,
                            }}
                        />
                    </div>
                    
                    {/* Thumbnail */}
                    {event.thumbnail && (
                        <div className="relative w-full h-56 overflow-hidden group">
                            <motion.img
                                initial={{ scale: 1 }}
                                animate={{ scale: 1.05 }}
                                transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
                                src={event.thumbnail}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                }}
                            />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="absolute inset-0"
                                style={{
                                    background: isDark
                                        ? "linear-gradient(to top, rgba(15,17,30,0.98) 0%, rgba(15,17,30,0.4) 40%, transparent 70%)"
                                        : "linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.4) 40%, transparent 70%)",
                                }}
                            />
                            {/* Animated sparkles on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="absolute top-4 right-4">
                                    <Sparkles className="w-5 h-5 animate-pulse" style={{ color: catColor }} />
                                </div>
                            </div>
                            {/* Year overlay */}
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="absolute bottom-4 left-6"
                            >
                                <span
                                    className="text-4xl font-black tracking-tight"
                                    style={{ color: catColor, textShadow: `0 0 30px ${catColor}40` }}
                                >
                                    {event.year}
                                </span>
                            </motion.div>
                        </div>
                    )}
                    
                    <div className={`px-6 ${event.thumbnail ? "pt-3" : "pt-6"} pb-6`}>
                        {/* Category badge + Year (if no thumbnail) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-2 mb-4"
                        >
                            <span
                                className="text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider transition-transform hover:scale-105"
                                style={{
                                    backgroundColor: catColor + "20",
                                    color: catColor,
                                    boxShadow: `0 0 20px ${catColor}20`,
                                }}
                            >
                                {event.category}
                            </span>
                            {!event.thumbnail && (
                                <span
                                    className="text-xl font-black ml-auto"
                                    style={{ color: catColor }}
                                >
                                    {event.year}
                                </span>
                            )}
                        </motion.div>
                        
                        {/* Title */}
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className={`text-xl font-bold leading-tight mb-5 ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                            {event.title}
                        </motion.h2>
                        
                        {/* Meta info */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap gap-4 mb-6"
                        >
                            {event.thumbnail && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className={`flex items-center gap-2 text-xs font-medium ${isDark ? "text-white/50" : "text-gray-500"}`}
                                >
                                    <Calendar className="w-4 h-4" style={{ color: catColor }} />
                                    <span>Year {event.year}</span>
                                </motion.div>
                            )}
                            {event.coordinates && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className={`flex items-center gap-2 text-xs font-medium ${isDark ? "text-white/50" : "text-gray-500"}`}
                                >
                                    <MapPin className="w-4 h-4" style={{ color: catColor }} />
                                    <span>
                                        {event.coordinates.lat.toFixed(2)}°, {event.coordinates.lon.toFixed(2)}°
                                    </span>
                                </motion.div>
                            )}
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 }}
                                className={`flex items-center gap-2 text-xs font-medium ${isDark ? "text-white/50" : "text-gray-500"}`}
                            >
                                <Tag className="w-4 h-4" style={{ color: catColor }} />
                                <span className="capitalize">{event.category}</span>
                            </motion.div>
                        </motion.div>
                        
                        {/* Action buttons */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-2.5 flex-wrap mb-6"
                        >
                            {/* Wikipedia */}
                            {event.pageID && (
                                <motion.a
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    href={`https://en.wikipedia.org/?curid=${event.pageID}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${isDark
                                        ? "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20"
                                        : "bg-purple-50 text-purple-600 hover:bg-purple-100 hover:shadow-lg hover:shadow-purple-500/10"
                                        }`}
                                    style={{
                                        border: `1px solid ${catColor}30`,
                                    }}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Wikipedia
                                </motion.a>
                            )}
                            
                            {/* Fly to location */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                    onFlyToEvent?.(event);
                                    onClose();
                                }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${isDark
                                    ? "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:shadow-lg"
                                    : "bg-black/5 text-gray-600 hover:bg-black/10 hover:text-gray-900 hover:shadow-lg"
                                    }`}
                            >
                                <MapPin className="w-4 h-4" />
                                Show on Map
                            </motion.button>
                            
                            {/* Bookmark */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => toggleBookmark(event._id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${isBookmarked
                                    ? isDark
                                        ? "bg-yellow-500/20 text-yellow-300 hover:shadow-lg hover:shadow-yellow-500/20"
                                        : "bg-yellow-50 text-yellow-600 hover:shadow-lg hover:shadow-yellow-500/10"
                                    : isDark
                                        ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:shadow-lg"
                                        : "bg-black/5 text-gray-600 hover:bg-black/10 hover:text-gray-900 hover:shadow-lg"
                                    }`}
                            >
                                {isBookmarked ? (
                                    <BookmarkCheck className="w-4 h-4" />
                                ) : (
                                    <Bookmark className="w-4 h-4" />
                                )}
                                {isBookmarked ? "Saved" : "Save"}
                            </motion.button>
                            
                            {/* Share */}
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleShare}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${copied
                                    ? isDark
                                        ? "bg-green-500/20 text-green-300"
                                        : "bg-green-50 text-green-600"
                                    : isDark
                                        ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                        : "bg-black/5 text-gray-600 hover:bg-black/10 hover:text-gray-900"
                                    }`}
                            >
                                {copied ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                                {copied ? "Copied!" : "Share"}
                            </motion.button>
                        </motion.div>
                        
                        {/* ───────── Related Events ───────── */}
                        <AnimatePresence>
                            {(loadingRelated || relatedEvents.length > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-7"
                                >
                                    <div className={`flex items-center gap-2 mb-4 text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-purple-400/70" : "text-purple-500/70"}`}>
                                        <Clock className="w-4 h-4" />
                                        Related Events
                                    </div>
                                    {loadingRelated ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className={`w-5 h-5 animate-spin ${isDark ? "text-purple-400" : "text-purple-500"}`} />
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
                                            {relatedEvents.map((re, idx) => (
                                                <motion.button
                                                    key={re._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.5 + idx * 0.1 }}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleEventCardClick(re)}
                                                    className={`flex-shrink-0 w-[170px] rounded-2xl p-3 text-left transition-all ${isDark
                                                        ? "bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-purple-500/30"
                                                        : "bg-black/[0.02] hover:bg-black/[0.05] border border-black/[0.05] hover:border-purple-200"
                                                        }`}
                                                >
                                                    {re.thumbnail && (
                                                        <div className="relative overflow-hidden rounded-xl mb-2.5 -mx-0.5">
                                                            <img
                                                                src={re.thumbnail}
                                                                alt=""
                                                                className="w-full h-16 object-cover transition-transform duration-500 hover:scale-110"
                                                                onError={(e) => { e.target.style.display = "none"; }}
                                                            />
                                                        </div>
                                                    )}
                                                    <p className={`text-[11px] font-semibold leading-snug line-clamp-2 mb-2 ${isDark ? "text-white/90" : "text-gray-800"}`}>
                                                        {re.title}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold`} style={{ color: categoryColors[re.category] || categoryColors.events }}>
                                                            {re.year}
                                                        </span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-gray-500"}`}>
                                                            {re.category}
                                                        </span>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {/* ───────── Nearby Events ───────── */}
                        <AnimatePresence>
                            {(loadingNearby || nearbyEvents.length > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: 0.6 }}
                                    className="mt-6"
                                >
                                    <div className={`flex items-center gap-2 mb-4 text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-cyan-400/70" : "text-cyan-500/70"}`}>
                                        <Navigation className="w-4 h-4" />
                                        Nearby Events
                                    </div>
                                    {loadingNearby ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className={`w-5 h-5 animate-spin ${isDark ? "text-cyan-400" : "text-cyan-500"}`} />
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
                                            {nearbyEvents.map((ne, idx) => (
                                                <motion.button
                                                    key={ne._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.6 + idx * 0.1 }}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleEventCardClick(ne)}
                                                    className={`flex-shrink-0 w-[170px] rounded-2xl p-3 text-left transition-all ${isDark
                                                        ? "bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-cyan-500/30"
                                                        : "bg-black/[0.02] hover:bg-black/[0.05] border border-black/[0.05] hover:border-cyan-200"
                                                        }`}
                                                >
                                                    {ne.thumbnail && (
                                                        <div className="relative overflow-hidden rounded-xl mb-2.5 -mx-0.5">
                                                            <img
                                                                src={ne.thumbnail}
                                                                alt=""
                                                                className="w-full h-16 object-cover transition-transform duration-500 hover:scale-110"
                                                                onError={(e) => { e.target.style.display = "none"; }}
                                                            />
                                                        </div>
                                                    )}
                                                    <p className={`text-[11px] font-semibold leading-snug line-clamp-2 mb-2 ${isDark ? "text-white/90" : "text-gray-800"}`}>
                                                        {ne.title}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-bold`} style={{ color: categoryColors[ne.category] || categoryColors.events }}>
                                                            {ne.year}
                                                        </span>
                                                        {ne.distance !== undefined && (
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${isDark ? "bg-white/5 text-white/50" : "bg-gray-100 text-gray-500"}`}>
                                                                ~{ne.distance.toFixed(1)}°
                                                            </span>
                                                        )}
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EventDetailModal;
