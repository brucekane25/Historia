"use client";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import EventTimeline from "./EventTimeline";
import { X } from "lucide-react";

const LeftDrawer = ({
  isDesktop,
  isLeftOpen,
  setisLeftOpen,
  events,
  onEventClick,
  mode,
}) => {
  const isDark = !mode;

  return (
    <Sheet open={isLeftOpen} onOpenChange={setisLeftOpen}>
      <SheetContent
        side="left"
        className="p-0 border-0"
        style={{
          minWidth: isDesktop ? "330px" : "290px",
          maxWidth: isDesktop ? "30vw" : "85vw",
          backgroundColor: isDark
            ? "rgba(15,17,30,0.95)"
            : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          color: isDark ? "#e5e7eb" : "#111827",
          boxShadow: isDark
            ? "0 0 40px rgba(99,102,241,0.05)"
            : "0 0 40px rgba(0,0,0,0.08)",
          position: "absolute",
          left: isDesktop ? "15px" : "15px",
          top: isDesktop ? "8vh" : "4vh",
          height: isDesktop ? "90vh" : "90vh",
          borderRadius: "16px",
          overflow: "hidden",
          border: isDark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <button
            onClick={() => setisLeftOpen(false)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark
                ? "text-white/40 hover:text-white hover:bg-white/10"
                : "text-gray-400 hover:text-gray-900 hover:bg-black/5"
              }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>
          <EventTimeline
            mode={mode}
            events={events}
            isLeftOpen={isLeftOpen}
            setisLeftOpen={setisLeftOpen}
            onEventClick={onEventClick}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LeftDrawer;