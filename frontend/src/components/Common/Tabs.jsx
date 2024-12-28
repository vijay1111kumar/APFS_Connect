import React, { useState } from "react";

const Tabs = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState("Promotions");

  const tabs = ["Promotions", "Reminders", "Messages", "Flows"];

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    onTabChange(tab); // Notify parent about the tab change
  };

  return (
    <div className="flex mb-6 justify-center">
      {/* Mobile View */}
      <div className="sm:hidden">
        <label htmlFor="Tab" className="sr-only">
          Tab
        </label>

        <select
          id="Tab"
          className="w-auto rounded-md p-2 border-gray-200"
          value={activeTab}
          onChange={(e) => handleTabClick(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab} value={tab}>
              {tab}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block">
        <nav className="flex gap-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`shrink-0 rounded-lg p-2 text-sm font-medium ${
                activeTab === tab
                  ? "bg-gray-100 text-gray-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
              aria-current={activeTab === tab ? "page" : undefined}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Tabs;
