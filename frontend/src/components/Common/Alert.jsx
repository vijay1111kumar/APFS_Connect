import React, { useEffect } from "react";

const Alert = ({ type, message, onClose }) => {
  const alertStyles = {
    success: {
      textcolor: "text-green-600",
      title: "Success 😁",
    },
    error: {
      textcolor: "text-red-600",
      title: "Error 😕",
    },
  };

  useEffect(() => {
    // Automatically dismiss after 3 seconds
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer); // Cleanup timeout on unmount
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md p-4 rounded-xl shadow-lg bg-white border border-gray-100 transition-opacity duration-300`}
    >
      <div className="flex items-start gap-4">
        <span className={`${alertStyles[type]?.textcolor}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </span>
        <div className="flex-1">
          <strong className="block font-medium text-gray-900">
            {alertStyles[type]?.title}
          </strong>
          <p className="mt-1 text-sm text-gray-700">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 transition hover:text-gray-600"
        >
          <span className="sr-only">Dismiss popup</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Alert;
