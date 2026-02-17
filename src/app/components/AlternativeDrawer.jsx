"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dice5 } from "lucide-react";

const AlternativeDrawer = ({
  isSlider,
  setIsSlider,
  events,
  randomizeEvents,
  onEventClick,
  mode,
}) => {
  const isDark = !mode;

  return (
    <Sheet open={isSlider} onOpenChange={setIsSlider}>
      <SheetContent
        side="bottom"
        className="max-h-[70vh] z-[999] min-w-[320px] overflow-auto border-0"
        style={{
          backgroundColor: isDark
            ? "rgba(15,17,30,0.95)"
            : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          color: isDark ? "#e5e7eb" : "#111827",
          borderTop: isDark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <SheetHeader>
          <SheetTitle>
            <div className="flex items-center justify-between">
              <h2
                className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"
                  }`}
              >
                Random Events
              </h2>
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
          </SheetTitle>
        </SheetHeader>

        {/* Horizontal scroll cards */}
        <div className="px-2 pb-4">
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth">
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => {
                  onEventClick(event);
                  setIsSlider(!isSlider);
                }}
                className="snap-start flex-shrink-0 w-[260px] rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(0,0,0,0.02)",
                  border: isDark
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "1px solid rgba(0,0,0,0.05)",
                }}
              >
                {/* Thumbnail */}
                {event.thumbnail && (
                  <div className="h-28 w-full rounded-t-xl overflow-hidden">
                    <img
                      src={event.thumbnail}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="p-3">
                  <h3
                    className={`text-sm font-medium line-clamp-2 ${isDark ? "text-white" : "text-gray-900"
                      }`}
                  >
                    {event.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-sm font-bold ${isDark ? "text-purple-400" : "text-purple-600"
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
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AlternativeDrawer;