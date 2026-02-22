"use client";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Bookmark, X, Trash2 } from "lucide-react";

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
    const bookmarkedEvents = events.filter((e) => bookmarks.includes(e._id));

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent
                side="right"
                className="p-0 border-0 z-[1040]"
                style={{
                    width: "min(400px, 30vw)",
                    minWidth: "340px",
                    backgroundColor: isDark
                        ? "rgba(15,17,30,0.95)"
                        : "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(20px)",
                    color: isDark ? "#e5e7eb" : "#111827",
                    boxShadow: isDark
                        ? "0 0 40px rgba(99,102,241,0.05)"
                        : "0 0 40px rgba(0,0,0,0.08)",
                }}
            >
                <SheetHeader className="px-5 pt-5 pb-3">
                    <SheetTitle asChild>
                        <div className="flex items-center gap-2">
                            <Bookmark
                                className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"
                                    }`}
                            />
                            <span className="text-lg font-semibold" style={{ color: isDark ? "#e5e7eb" : "#111827" }}>Bookmarks</span>
                            {bookmarkedEvents.length > 0 && (
                                <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark
                                        ? "bg-purple-500/20 text-purple-300"
                                        : "bg-purple-100 text-purple-600"
                                        }`}
                                >
                                    {bookmarkedEvents.length}
                                </span>
                            )}
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="px-4 pb-4 overflow-y-auto h-[calc(100%-64px)]">
                    {bookmarkedEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                            <Bookmark
                                className={`w-10 h-10 ${isDark ? "text-white/10" : "text-gray-200"
                                    }`}
                            />
                            <p
                                className={`text-sm ${isDark ? "text-white/30" : "text-gray-400"
                                    }`}
                            >
                                No bookmarks yet
                            </p>
                            <p
                                className={`text-xs ${isDark ? "text-white/20" : "text-gray-300"
                                    }`}
                            >
                                Click the ⭐ on any event to save it here
                            </p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {bookmarkedEvents.map((event) => (
                                <li
                                    key={event._id}
                                    className="glass-card p-3 cursor-pointer group relative"
                                    style={{
                                        background: isDark
                                            ? "rgba(255,255,255,0.04)"
                                            : "rgba(0,0,0,0.02)",
                                        borderColor: isDark
                                            ? "rgba(255,255,255,0.06)"
                                            : "rgba(0,0,0,0.05)",
                                    }}
                                    onClick={() => onEventClick(event)}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Thumbnail */}
                                        <div
                                            className={`h-14 w-14 rounded-lg flex-shrink-0 overflow-hidden ${!event.thumbnail
                                                ? isDark
                                                    ? "bg-white/5"
                                                    : "bg-gray-100"
                                                : ""
                                                }`}
                                        >
                                            {event.thumbnail && (
                                                <img
                                                    src={event.thumbnail}
                                                    alt={event.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>

                                        <div className="flex-grow min-w-0">
                                            <h3
                                                className={`text-sm font-medium line-clamp-2 ${isDark ? "text-white" : "text-gray-900"
                                                    }`}
                                            >
                                                {event.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span
                                                    className={`text-xs font-semibold ${isDark ? "text-purple-400" : "text-purple-600"
                                                        }`}
                                                >
                                                    {event.year}
                                                </span>
                                                <span
                                                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark
                                                        ? "bg-white/10 text-white/60"
                                                        : "bg-gray-100 text-gray-500"
                                                        }`}
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
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark
                                                ? "text-white/40 hover:text-red-400 hover:bg-white/10"
                                                : "text-gray-400 hover:text-red-500 hover:bg-black/5"
                                                }`}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default Bookmarks;
