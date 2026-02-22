"use client";
import { FixedSizeList as List } from "react-window";

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

    return (
      <div style={style} className="flex items-center px-3">
        {/* Left content or spacer */}
        <div className={`flex-1 ${isLeft ? "pr-3" : ""}`}>
          {isLeft && (
            <div
              onClick={() => {
                onEventClick(event);
                setLeftOpen(!leftOpen);
              }}
              className="glass-card p-2.5 cursor-pointer"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.02)",
                borderColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.05)",
              }}
            >
              <h3
                className={`text-sm font-bold ${isDark ? "text-purple-400" : "text-purple-600"
                  }`}
              >
                {event.year}
              </h3>
              <p
                className={`text-xs line-clamp-2 mt-0.5 ${isDark ? "text-white/70" : "text-gray-600"
                  }`}
              >
                {event.title}
              </p>
            </div>
          )}
        </div>

        {/* Center timeline */}
        <div className="flex flex-col items-center relative">
          <div
            className={`w-2.5 h-2.5 rounded-full z-10 ${isDark ? "bg-purple-500 shadow-sm shadow-purple-500/30" : "bg-purple-500"
              }`}
          />
          {index < sortedEvents.length - 1 && (
            <div
              className={`w-px absolute top-3 bottom-0 ${isDark ? "bg-white/8" : "bg-gray-200"
                }`}
              style={{ height: "calc(100% - 8px)" }}
            />
          )}
        </div>

        {/* Right content or spacer */}
        <div className={`flex-1 ${!isLeft ? "pl-3" : ""}`}>
          {!isLeft && (
            <div
              onClick={() => {
                onEventClick(event);
                setisLeftOpen(!isLeftOpen);
              }}
              className="glass-card p-2.5 cursor-pointer"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.02)",
                borderColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.05)",
              }}
            >
              <h3
                className={`text-sm font-bold ${isDark ? "text-purple-400" : "text-purple-600"
                  }`}
              >
                {event.year}
              </h3>
              <p
                className={`text-xs line-clamp-2 mt-0.5 ${isDark ? "text-white/70" : "text-gray-600"
                  }`}
              >
                {event.title}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[87vh] px-1">
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
