import React from "react";

const Header = ({ title, description, buttonText, onButtonClick }) => (
  <header className="flex items-center justify-between mb-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    <button
      onClick={onButtonClick} 
      className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
    >
      {buttonText}
    </button>
  </header>
);

export default Header;
