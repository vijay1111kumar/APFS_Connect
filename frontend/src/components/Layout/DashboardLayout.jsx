import React from "react";
import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-grow">
        <main className="p-12 h-full overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
