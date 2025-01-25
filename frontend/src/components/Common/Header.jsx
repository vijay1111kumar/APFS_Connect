import React from "react";

const Header = ({ title, description, buttonText=null, onButtonClick=null }) => (
  <header className="flex items-center justify-between p-4 rounded-md" >
    <div>
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    {(buttonText && <button
      onClick={onButtonClick} 
      className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-highlight"
    >
      {buttonText}
    </button>)}
  </header>
);

export default Header;
