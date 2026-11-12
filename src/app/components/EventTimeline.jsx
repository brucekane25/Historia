"use client";
import { useEffect, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { getCategoryColor } from "@/lib/category-colors";

const EventTimeline = ({
  events,
  onEventClick,
  leftOpen,
  lightMode,
  setLeftOpen,
}) => {
  const isDark = !lightMode;
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 300, height: 600 });
  const sortedEvents = [...events].sort((a, b) => b.year - a.year);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const measure = () => {
      setSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const Row = ({ index, style }) => {
    const event = sortedEvents[index];
    const isLeft = index % 2 === 0;
    const catColor = getCategoryColor(event.category);

    const handleClick = () => {
      onEventClick(event);
      setLeftOpen(false);
    };

    const cardContent = (
      <div
        onClick={handleClick}
        className="glass-card p-2.5 cursor-pointer transition-all hover:scale-[1.02]"
        style={{
          background: isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(0,0,0,0.02)",
          borderColor: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex items-center gap-2">
          <h3
            className={`text-sm font-bold ${isDark ? "text-purple-400" : "text-purple-600"}`}
          >
            {event.year ?? "—"}
          </h3>
          <span
            className="text-[9px] px-1 py-0.5 rounded-full font-medium capitalize"
            style={{
              backgroundColor: catColor + "20",
              color: catColor,
            }}
          >
            {event.category || "unknown"}
          </span>
        </div>
        <p
          className={`text-xs line-clamp-2 mt-0.5 ${isDark ? "text-white/70" : "text-gray-600"}`}
        >
          {event.title}
        </p>
      </div>
    );

    return (
      <div style={style} className="flex items-center px-3">
        <div className={`flex-1 ${isLeft ? "pr-3" : ""}`}>
          {isLeft && cardContent}
        </div>

        <div className="flex flex-col items-center relative">
          <div
            className={`w-2.5 h-2.5 rounded-full z-10 ${isDark ? "bg-purple-500 shadow-sm shadow-purple-500/30" : "bg-purple-500"}`}
          />
          {index < sortedEvents.length - 1 && (
            <div
              className={`w-px absolute top-3 bottom-0 ${isDark ? "bg-white/8" : "bg-gray-200"}`}
              style={{ height: "calc(100% - 8px)" }}
            />
          )}
        </div>

        <div className={`flex-1 ${!isLeft ? "pl-3" : ""}`}>
          {!isLeft && cardContent}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="h-full px-1">
      {sortedEvents.length === 0 ? (
        <div
          className={`flex h-full items-center justify-center px-6 text-center text-xs ${
            isDark ? "text-white/30" : "text-gray-400"
          }`}
        >
          No events in the current filter.
        </div>
      ) : (
        <List
          itemCount={sortedEvents.length}
          height={size.height}
          itemSize={72}
          width={size.width}
          itemKey={(index) => sortedEvents[index]?._id || index}
        >
          {Row}
        </List>
      )}
    </div>
  );
};

export default EventTimeline;