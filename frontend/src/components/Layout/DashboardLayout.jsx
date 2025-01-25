import React from "react";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <div className="flex-row">
        <Sidebar />
      </div>

      <div className="flex-grow">
        <main className="lg:p-8 sm:p-6 h-full overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
