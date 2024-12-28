import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import Card from "../components/Common/Card";
import Tabs from "../components/Common/Tabs";
import Divider from "../components/Common/Divider";
import { fetchDashboardMetrics } from "../utils/api"; // Import the new function

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("Promotions");
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchDashboardMetrics(activeTab);
        setMetrics(data);
      } catch (error) {
        console.error("Error loading dashboard metrics:", error);
      }
    };

    loadMetrics();
  }, [activeTab]);

  return (
    <DashboardLayout>
      <Tabs onTabChange={setActiveTab} />
      {/* <Divider /> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} {...metric} />
        ))}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
