"use client";
import React, { useState } from "react";
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
} from "lucide-react";

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

    return (
        <Dialog open={!!event} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent
                className="sm:max-w-[520px] p-0 overflow-hidden border-0 z-[1040]"
                style={{
                    background: isDark
                        ? "rgba(15,17,30,0.97)"
                        : "rgba(255,255,255,0.97)",
                    backdropFilter: "blur(24px)",
                    border: isDark
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "1px solid rgba(0,0,0,0.06)",
                    color: isDark ? "#e5e7eb" : "#111827",
                }}
            >
                <DialogTitle className="sr-only">{event.title}</DialogTitle>
                {/* Thumbnail */}
                {event.thumbnail && (
                    <div className="relative w-full h-52 overflow-hidden">
                        <img
                            src={event.thumbnail}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = "none";
                            }}
                        />
                        <div
                            className="absolute inset-0"
                            style={{
                                background: isDark
                                    ? "linear-gradient(to top, rgba(15,17,30,0.97) 0%, transparent 60%)"
                                    : "linear-gradient(to top, rgba(255,255,255,0.97) 0%, transparent 60%)",
                            }}
                        />
                        {/* Year overlay */}
                        <div className="absolute bottom-3 left-5">
                            <span
                                className="text-3xl font-extrabold"
                                style={{ color: catColor }}
                            >
                                {event.year}
                            </span>
                        </div>
                    </div>
                )}

                <div className={`px-5 ${event.thumbnail ? "pt-2" : "pt-5"} pb-5`}>
                    {/* Category badge + Year (if no thumbnail) */}
                    <div className="flex items-center gap-2 mb-3">
                        <span
                            className="text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wider"
                            style={{
                                backgroundColor: catColor + "20",
                                color: catColor,
                            }}
                        >
                            {event.category}
                        </span>
                        {!event.thumbnail && (
                            <span
                                className="text-lg font-extrabold ml-auto"
                                style={{ color: catColor }}
                            >
                                {event.year}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h2
                        className={`text-lg font-bold leading-snug mb-4 ${isDark ? "text-white" : "text-gray-900"
                            }`}
                    >
                        {event.title}
                    </h2>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-3 mb-5">
                        {event.thumbnail && (
                            <div
                                className={`flex items-center gap-1.5 text-xs ${isDark ? "text-white/40" : "text-gray-400"
                                    }`}
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Year {event.year}</span>
                            </div>
                        )}
                        {event.coordinates && (
                            <div
                                className={`flex items-center gap-1.5 text-xs ${isDark ? "text-white/40" : "text-gray-400"
                                    }`}
                            >
                                <MapPin className="w-3.5 h-3.5" />
                                <span>
                                    {event.coordinates.lat.toFixed(2)}°,{" "}
                                    {event.coordinates.lon.toFixed(2)}°
                                </span>
                            </div>
                        )}
                        <div
                            className={`flex items-center gap-1.5 text-xs ${isDark ? "text-white/40" : "text-gray-400"
                                }`}
                        >
                            <Tag className="w-3.5 h-3.5" />
                            <span className="capitalize">{event.category}</span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Wikipedia */}
                        {event.pageID && (
                            <a
                                href={`https://en.wikipedia.org/?curid=${event.pageID}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isDark
                                    ? "bg-purple-500/15 text-purple-300 hover:bg-purple-500/25"
                                    : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                                    }`}
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Wikipedia
                            </a>
                        )}

                        {/* Fly to location */}
                        <button
                            onClick={() => {
                                onFlyToEvent?.(event);
                                onClose();
                            }}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isDark
                                ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                : "bg-black/5 text-gray-600 hover:bg-black/10 hover:text-gray-900"
                                }`}
                        >
                            <MapPin className="w-3.5 h-3.5" />
                            Show on Map
                        </button>

                        {/* Bookmark */}
                        <button
                            onClick={() => toggleBookmark(event._id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isBookmarked
                                ? isDark
                                    ? "bg-yellow-500/15 text-yellow-300"
                                    : "bg-yellow-50 text-yellow-600"
                                : isDark
                                    ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                    : "bg-black/5 text-gray-600 hover:bg-black/10 hover:text-gray-900"
                                }`}
                        >
                            {isBookmarked ? (
                                <BookmarkCheck className="w-3.5 h-3.5" />
                            ) : (
                                <Bookmark className="w-3.5 h-3.5" />
                            )}
                            {isBookmarked ? "Saved" : "Save"}
                        </button>

                        {/* Share */}
                        <button
                            onClick={handleShare}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${copied
                                ? isDark
                                    ? "bg-green-500/15 text-green-300"
                                    : "bg-green-50 text-green-600"
                                : isDark
                                    ? "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                                    : "bg-black/5 text-gray-600 hover:bg-black/10 hover:text-gray-900"
                                }`}
                        >
                            {copied ? (
                                <Check className="w-3.5 h-3.5" />
                            ) : (
                                <Copy className="w-3.5 h-3.5" />
                            )}
                            {copied ? "Copied!" : "Share"}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EventDetailModal;
