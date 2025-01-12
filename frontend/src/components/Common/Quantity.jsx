import React, { useState } from "react";

const Quantity = ({ label="Quantity", value, onChange, lower_limit = 1, upper_limit = 100, children }) => {

  const increment = () => {
    if (value < upper_limit) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > lower_limit) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= lower_limit && newValue <= upper_limit) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col gap-1 ">
      <label htmlFor="Quantity" className="text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex items-center justify-between rounded border border-gray-300">
        <div>
          <button
            type="button"
            onClick={decrement}
            className="size-10  text-gray-600 transition duration-150 hover:bg-focus"
          >
            -
          </button>

          <input
            type="number"
            id="Quantity"
            value={value}
            onChange={handleInputChange}
            className="w-16 border-transparent text-center text-gray-700 sm:text-sm focus:ring-focus focus:border-focus [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
          />

          <button
            type="button"
            onClick={increment}
            className="size-10  text-gray-600 transition hover:bg-focus hover:opacity-75"
          >
            +
          </button>
        </div>

        <div>{children}</div>

      </div>
    </div>
  );
};

export default Quantity;
