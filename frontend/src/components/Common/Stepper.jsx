import React from "react";

const Stepper = ({ steps = [], completed = false, cutOff = null, layout = "vertical" }) => {
  const isHorizontal = layout === "horizontal";

  return (
    <ol
      className={`${
        isHorizontal
          ? "flex space-x-8 border-0"
          : "relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400"
      }`}
    >
      {steps.map((step, index) => {
        // Determine the status of the step
        const isCompleted = completed || (cutOff !== null && index < cutOff);
        const isCurrent = cutOff !== null && index === cutOff;

        // Define styles based on the status
        const stepStyles = isCompleted
          ? "bg-green-200 dark:bg-green-900 text-green-500 dark:text-green-400"
          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400";

        return (
            <div className="hover:scale-105 duration-100">
          <li
            key={index}
            className={`${
              isHorizontal
                ? "flex flex-col items-center"
                : "mb-10 ms-6"
            }`}
          >
            {/* Step Icon */}
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-full ring-4 ring-white dark:ring-gray-900 ${stepStyles} ${
                isHorizontal ? "mb-2" : "absolute -start-4"
              }`}
            >
              {isCompleted ? (
                <svg
                  className="w-3.5 h-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 12"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5.917 5.724 10.5 15 1.5"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5 "
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 16"
                >
                  <path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0-2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0-2Z" />
                </svg>
              )}
            </span>

            {/* Step Title and Description */}
            <div className={`${isHorizontal ? "text-center" : ""}`}>
              <h3
                className={`font-medium leading-tight ${
                  isCurrent ? "text-red-600" : ""
                }`}
              >
                {step.title}
              </h3>
              <p className="text-sm">{step.description}</p>
            </div>

            {/* Connecting Line for Horizontal Layout */}
            {isHorizontal && index !== steps.length - 1 && (
              <div
                className="absolute top-4 left-10 right-10 h-0.5 bg-gray-200 dark:bg-gray-700"
                style={{
                  transform: "translateX(-50%)",
                  width: "calc(100% - 3rem)",
                }}
              />
            )}
          </li>
          </div>
        );
      })}
    </ol>
  );
};

export default Stepper;
