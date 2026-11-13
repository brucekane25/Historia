"use client";
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { CATEGORY_COLORS as categoryColors } from "@/lib/category-colors";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { wikiImage } from "@/lib/wiki-image";


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
            setLoadingRelated(false);
            setLoadingNearby(false);
            return;
        }

        const controller = new AbortController();

        // Fetch related events
        const fetchRelated = async () => {
            setLoadingRelated(true);
            try {
                const res = await fetch(`/api/events/related/${event._id}`, {
                    signal: controller.signal,
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!controller.signal.aborted) {
                        setRelatedEvents(data.related || []);
                    }
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Failed to fetch related events:', err);
                }
            } finally {
                if (!controller.signal.aborted) setLoadingRelated(false);
            }
        };

        // Fetch nearby events
        const fetchNearby = async () => {
            if (!event.coordinates) {
                setNearbyEvents([]);
                setLoadingNearby(false);
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
                const res = await fetch(`/api/events/nearby?${params}`, {
                    signal: controller.signal,
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!controller.signal.aborted) {
                        setNearbyEvents(data.events || []);
                    }
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Failed to fetch nearby events:', err);
                }
            } finally {
                if (!controller.signal.aborted) setLoadingNearby(false);
            }
        };

        fetchRelated();
        fetchNearby();

        return () => controller.abort();
    }, [event?._id]);

    if (!event) return null;

    const catColor = categoryColors[event.category] || "#8a8a80";
    const hasYear = Number.isFinite(event.year);
    const hasCoordinates =
        Number.isFinite(event.coordinates?.lat) &&
        Number.isFinite(event.coordinates?.lon);

    const handleShare = async () => {
        const url = `${window.location.origin}${window.location.pathname}?event=${event._id}`;
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
                className="sm:max-w-[560px] p-0 overflow-hidden z-[1040]"
                style={{
                    background: "var(--plate-strong)",
                    backdropFilter: "blur(20px) saturate(115%)",
                    border: "1px solid var(--hairline)",
                    color: "var(--parchment)",
                    maxHeight: "88vh",
                    borderRadius: "3px",
                    boxShadow: "var(--plate-shadow)",
                }}
            >
                <DialogTitle className="sr-only">{event.title}</DialogTitle>
                <div className="overflow-y-auto max-h-[88vh]">
                    {/* Category rule: a surveyor's line in the event's ink */}
                    <div className="relative h-[3px] w-full bg-hairline">
                        <div
                            className="absolute inset-y-0 left-0 right-1/3"
                            style={{ backgroundColor: catColor }}
                        />
                    </div>

                    {/* Thumbnail */}
                    {event.thumbnail && (
                        <div className="relative w-full h-52 overflow-hidden group">
                            <motion.img
                                initial={{ scale: 1 }}
                                animate={{ scale: 1.04 }}
                                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                                src={wikiImage(event.thumbnail)}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                style={{ filter: "saturate(0.88) contrast(1.04)" }}
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
                                        ? "linear-gradient(to top, rgba(13,17,16,0.98) 0%, rgba(13,17,16,0.35) 45%, transparent 72%)"
                                        : "linear-gradient(to top, rgba(239,233,218,0.98) 0%, rgba(239,233,218,0.35) 45%, transparent 72%)",
                                }}
                            />
                            {/* Year plate over the image */}
                            {hasYear && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="absolute bottom-4 left-6 flex items-baseline gap-3"
                                >
                                    <span
                                        className="display text-4xl font-semibold tabular leading-none text-parchment"
                                        style={{ textShadow: "0 2px 18px rgba(0,0,0,0.55)" }}
                                    >
                                        {event.year}
                                    </span>
                                    <span className="eyebrow text-parchment/70">Year</span>
                                </motion.div>
                            )}
                        </div>
                    )}

                    <div className={`px-6 ${event.thumbnail ? "pt-4" : "pt-6"} pb-6`}>
                        {/* Category badge + Year (if no thumbnail) */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-3 mb-4"
                        >
                            <span
                                className="eyebrow px-2.5 py-1 rounded-[2px] border"
                                style={{
                                    borderColor: `${catColor}66`,
                                    backgroundColor: `${catColor}1f`,
                                    color: catColor,
                                }}
                            >
                                {event.category}
                            </span>
                            {!event.thumbnail && hasYear && (
                                <span
                                    className="ml-auto display text-2xl font-semibold tabular leading-none"
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
                            className="font-display text-[22px] leading-[1.25] font-semibold text-parchment mb-4"
                        >
                            {event.title}
                        </motion.h2>

                        {/* Meta info */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap gap-x-5 gap-y-2 mb-5 pb-5 border-b border-hairline font-mono tabular text-[11px] text-dim"
                        >
                            {hasYear && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <Calendar className="w-3.5 h-3.5" style={{ color: catColor }} />
                                    <span>Year {event.year}</span>
                                </motion.span>
                            )}
                            {hasCoordinates && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center gap-1.5"
                                >
                                    <MapPin className="w-3.5 h-3.5" style={{ color: catColor }} />
                                    <span>
                                        {event.coordinates.lat.toFixed(2)}°, {event.coordinates.lon.toFixed(2)}°
                                    </span>
                                </motion.span>
                            )}
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 }}
                                className="flex items-center gap-1.5"
                            >
                                <Tag className="w-3.5 h-3.5" style={{ color: catColor }} />
                                <span className="capitalize">{event.category}</span>
                            </motion.span>
                        </motion.div>

                        {/* Action buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-2 flex-wrap mb-6"
                        >
                            {/* Wikipedia */}
                            {event.pageID && (
                                <motion.a
                                    whileHover={{ y: -1 }}
                                    whileTap={{ y: 0 }}
                                    href={`https://en.wikipedia.org/?curid=${event.pageID}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-[2px] eyebrow border border-hairline text-dim hover:text-parchment hover:border-hairline-strong transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    Wikipedia
                                </motion.a>
                            )}

                            {/* Fly to location */}
                            <motion.button
                                whileHover={{ y: -1 }}
                                whileTap={{ y: 0 }}
                                onClick={() => {
                                    onFlyToEvent?.(event);
                                    onClose();
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-[2px] eyebrow border border-cinnabar/45 bg-cinnabar/12 text-cinnabar hover:bg-cinnabar/22 transition-colors"
                            >
                                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                                Show on Map
                            </motion.button>

                            {/* Bookmark */}
                            <motion.button
                                whileHover={{ y: -1 }}
                                whileTap={{ y: 0 }}
                                onClick={() => toggleBookmark(event._id)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-[2px] eyebrow border transition-colors ${isBookmarked
                                    ? "border-brass/45 bg-brass/12 text-brass"
                                    : "border-hairline text-dim hover:text-parchment hover:border-hairline-strong"
                                    }`}
                            >
                                {isBookmarked ? (
                                    <BookmarkCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                                ) : (
                                    <Bookmark className="w-3.5 h-3.5" strokeWidth={1.5} />
                                )}
                                {isBookmarked ? "Saved" : "Save"}
                            </motion.button>

                            {/* Share */}
                            <motion.button
                                whileHover={{ y: -1 }}
                                whileTap={{ y: 0 }}
                                onClick={handleShare}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-[2px] eyebrow border transition-colors ${copied
                                    ? "border-verdigris/45 bg-verdigris/12 text-verdigris"
                                    : "border-hairline text-dim hover:text-parchment hover:border-hairline-strong"
                                    }`}
                            >
                                {copied ? (
                                    <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                                ) : (
                                    <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
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
                                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-hairline eyebrow text-cinnabar">
                                        <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                                        Related Events
                                    </div>
                                    {loadingRelated ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className="w-5 h-5 animate-spin text-cinnabar" />
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
                                            {relatedEvents.map((re, idx) => (
                                                <motion.button
                                                    key={re._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.5 + idx * 0.1 }}
                                                    whileHover={{ y: -2 }}
                                                    whileTap={{ y: 0 }}
                                                    onClick={() => handleEventCardClick(re)}
                                                    className="flex-shrink-0 w-[170px] rounded-[3px] p-3 text-left border border-hairline hover:border-cinnabar/40 transition-colors"
                                                >
                                                    {re.thumbnail && (
                                                        <div className="relative overflow-hidden rounded-[2px] mb-2.5 -mx-0.5">
                                                            <img
                                                                src={wikiImage(re.thumbnail)}
                                                                alt=""
                                                                className="w-full h-16 object-cover"
                                                                style={{ filter: "saturate(0.88)" }}
                                                                onError={(e) => { e.target.style.display = "none"; }}
                                                            />
                                                        </div>
                                                    )}
                                                    <p className="font-display text-[12px] leading-snug line-clamp-2 mb-2 text-parchment">
                                                        {re.title}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono tabular text-[10px]" style={{ color: categoryColors[re.category] || categoryColors.events }}>
                                                            {Number.isFinite(re.year) ? re.year : "—"}
                                                        </span>
                                                        <span className="eyebrow text-dim/80">
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
                                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-hairline eyebrow text-verdigris">
                                        <Navigation className="w-3.5 h-3.5" strokeWidth={1.5} />
                                        Nearby Events
                                    </div>
                                    {loadingNearby ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className="w-5 h-5 animate-spin text-verdigris" />
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2 scrollbar-hide">
                                            {nearbyEvents.map((ne, idx) => (
                                                <motion.button
                                                    key={ne._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.6 + idx * 0.1 }}
                                                    whileHover={{ y: -2 }}
                                                    whileTap={{ y: 0 }}
                                                    onClick={() => handleEventCardClick(ne)}
                                                    className="flex-shrink-0 w-[170px] rounded-[3px] p-3 text-left border border-hairline hover:border-verdigris/45 transition-colors"
                                                >
                                                    {ne.thumbnail && (
                                                        <div className="relative overflow-hidden rounded-[2px] mb-2.5 -mx-0.5">
                                                            <img
                                                                src={wikiImage(ne.thumbnail)}
                                                                alt=""
                                                                className="w-full h-16 object-cover"
                                                                style={{ filter: "saturate(0.88)" }}
                                                                onError={(e) => { e.target.style.display = "none"; }}
                                                            />
                                                        </div>
                                                    )}
                                                    <p className="font-display text-[12px] leading-snug line-clamp-2 mb-2 text-parchment">
                                                        {ne.title}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono tabular text-[10px]" style={{ color: categoryColors[ne.category] || categoryColors.events }}>
                                                            {Number.isFinite(ne.year) ? ne.year : "—"}
                                                        </span>
                                                        {ne.distance !== undefined && (
                                                            <span className="eyebrow text-dim/80">
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
