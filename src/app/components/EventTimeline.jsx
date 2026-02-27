"use client";
import { FixedSizeList as List } from "react-window";

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

const EventTimeline = ({
  events,
  onEventClick,
  leftOpen,
  lightMode,
  setLeftOpen,
}) => {
  const isDark = !lightMode;
  const sortedEvents = [...events].sort((a, b) => b.year - a.year);

  const Row = ({ index, style }) => {
    const event = sortedEvents[index];
    const isLeft = index % 2 === 0;
    const catColor = categoryColors[event.category] || "#6b7280";

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
            {event.year}
          </h3>
          <span
            className="text-[9px] px-1 py-0.5 rounded-full font-medium capitalize"
            style={{
              backgroundColor: catColor + "20",
              color: catColor,
            }}
          >
            {event.category}
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
        {/* Left content or spacer */}
        <div className={`flex-1 ${isLeft ? "pr-3" : ""}`}>
          {isLeft && cardContent}
        </div>

        {/* Center timeline */}
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

        {/* Right content or spacer */}
        <div className={`flex-1 ${!isLeft ? "pl-3" : ""}`}>
          {!isLeft && cardContent}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full px-1">
      <List
        itemCount={sortedEvents.length}
        height={900}
        itemSize={72}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
};

export default EventTimeline;
