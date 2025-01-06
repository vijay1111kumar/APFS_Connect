import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const menu = [
    { label: "Dashboard", path: "/" },
    // { label: "Summary", path: "/summary" },
    { label: "Promotions", path: "/promotions" },
    { label: "Reminders", path: "/remainders" },
    // { label: "User Stats", path: "/user-stats" },
    // { label: "Flow Stats", path: "/flow-stats" },
    // { label: "Time-Based Insights", path: "/time-based" },
    // { label: "Error Analytics", path: "/error-analytics" },
    // { label: "Test Page", path: "/test" },
  ];

  return (
    <div className="flex h-screen flex-col justify-between border-e bg-white w-64">
      {/* Logo */}
      <div className="px-4 py-6">
        <div className="grid place-content-center">
          <img src="https://app.loan2wheels.com/web/login/logo.png" alt="Logo" className="h-auto w-auto rounded-lg" />
        </div>

        {/* Navigation */}
        <ul className="mt-6 space-y-1">
          {menu.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-2 text-sm font-medium ${
                    isActive
                      ? "text-gray-700 bg-gray-100"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="px-4 py-6">
        <p className="text-sm text-center text-gray-500">
          Made with ❤️ by VJ
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
