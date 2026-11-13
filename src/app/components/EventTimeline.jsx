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
            ? "color-mix(in srgb, var(--parchment) 4%, transparent)"
            : "color-mix(in srgb, var(--parchment) 2%, transparent)",
          borderColor: isDark
            ? "color-mix(in srgb, var(--parchment) 6%, transparent)"
            : "color-mix(in srgb, var(--parchment) 5%, transparent)",
        }}
      >
        <div className="flex items-center gap-2">
          <h3
            className={`text-sm font-bold ${"text-cinnabar"}`}
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
          className={`text-xs line-clamp-2 mt-0.5 ${isDark ? "text-parchment/70" : "text-dim"}`}
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
            className={`w-2.5 h-2.5 rounded-full z-10 ${isDark ? "bg-cinnabar/12 shadow-sm shadow-cinnabar/30" : "bg-cinnabar/12"}`}
          />
          {index < sortedEvents.length - 1 && (
            <div
              className={`w-px absolute top-3 bottom-0 ${isDark ? "bg-parchment/8" : "bg-muted"}`}
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
            isDark ? "text-parchment/30" : "text-dim"
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