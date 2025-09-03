"use client"
import React from "react";

const SidePaneEvents = ({ events, randomizeEvents, onEventClick }) => {
  return (
  <>
  <div className="flex items-center mt-3 pr-16 justify-between">

        <h2 className="text-lg pl-7 font-semibold mb-4">Random Events</h2>
    <button
        onClick={randomizeEvents} 
        className="mb-4 px-4 py-2 ml-7 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
        Randomize
      </button>
        </div>
    <div className="w-[450px] p-4 overflow-y-auto max-h-[602px] bg-gray-100">
      <ul className="space-y-4">
        {events.map((event) => (
          <li
            key={event._id}
            className="p-3 bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onEventClick(event)}
          >
            <div className="flex min-w-full items-center justify-between ">
              <div className="left_section flex items-center gap-4">
                <div
                  className={`h-16 w-16 min-w-16 rounded-md ${
                    event.thumbnail ? "overflow-hidden" : "bg-gray-300"
                  }`}
                >
                  {event.thumbnail ? (
                    <img
                      src={event.thumbnail}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="flex flex-col">
                  <h3 className="text-base font-medium text-gray-800 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600">{event.year}</p>
                </div>
              </div>
              <div className="bg-gray-950 p-[5px] rounded-md text-white">
                {event.category}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
</>
  );
};
export default SidePaneEvents;
