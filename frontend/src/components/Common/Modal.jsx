import React from "react";

const Modal = ({ header, onClose, children }) => {
  return (
    <div className="fixed inset-0 -space-y-6 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70">
      <div className="bg-white rounded p-8 sm-p-6 shadow-lg w-8/12">
        <div className="flex justify-between">

          <div>
            <h1 className="text-xl font-bold mb-2">{header}</h1>
          </div>

          <div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
