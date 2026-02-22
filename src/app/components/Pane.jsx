"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dice5, X } from "lucide-react";

const Pane = ({
  isOpen,
  setIsOpen,
  lightMode,
  events,
  randomEvents,
  randomizeEvents,
  onEventClick,
}) => {
  const isDark = !lightMode;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="p-0 border-0"
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
        <SheetHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-3">
          <SheetTitle className="text-lg font-semibold" style={{ color: isDark ? "#e5e7eb" : "#111827" }}>Random Events</SheetTitle>
          <div className="flex gap-2 items-center">
            <button
              onClick={randomizeEvents}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isDark
                ? "bg-purple-500/15 text-purple-300 hover:bg-purple-500/25"
                : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                }`}
            >
              <Dice5 className="w-3.5 h-3.5" />
              Randomize
            </button>
          </div>
        </SheetHeader>

        <div className="px-4 pb-4 overflow-y-auto h-[calc(100%-64px)]">
          <ul className="space-y-3">
            {randomEvents.map((event) => (
              <li
                key={event._id}
                className="glass-card p-3 cursor-pointer"
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
                </div>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Pane;
