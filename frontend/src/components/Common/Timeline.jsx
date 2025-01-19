import React from "react";

const Timeline = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No timeline data available.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-0 left-4 w-px bg-gray-300 h-full"></div>
      <ul className="space-y-6">
        {data.map((event, index) => (
          <li key={event.id} className="relative flex items-center gap-4">
            {/* Timeline Dot */}
            <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white">
              {index + 1}
            </div>

            {/* Event Content */}
            <div className="flex-1 p-4 bg-white rounded-lg shadow-md border border-gray-200">
              <p className="text-sm text-gray-700 font-semibold">
                {new Date(event.time).toLocaleString()}
              </p>
              <p className="mt-1 text-gray-600">
                Status:{" "}
                <span
                  className={`font-bold ${
                    event.status === "Completed"
                      ? "text-green-600"
                      : event.status === "Scheduled"
                      ? "text-blue-600"
                      : event.status === "Failed"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {event.status}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Timeline;
