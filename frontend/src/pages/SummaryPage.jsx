import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { fetchSummary } from "../utils/api";

const SummaryPage = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const getSummaryData = async () => {
      try {
        const { data } = await fetchSummary();
        setSummary(data);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };

    getSummaryData();
  }, []);

  if (!summary) return <div className="text-gray-700">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6 bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-800">Summary Dashboard</h2>

        {/* Grid Layout for Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Overview Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-800">Overview</h3>
              <ul className="mt-4 text-gray-600 space-y-2">
                <li>
                  <strong>Total Messages Sent:</strong> {summary.overview.total_messages_sent}
                </li>
                <li>
                  <strong>Active Users:</strong> {summary.overview.active_users}
                </li>
                <li>
                  <strong>Flows Completed:</strong> {summary.overview.flows_completed}
                </li>
              </ul>
            </div>
          </div>

          {/* Promotions Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-800">Promotions</h3>
              <ul className="mt-4 text-gray-600 space-y-2">
                <li>
                  <strong>Total Sent:</strong> {summary.promotions.total_promotions_sent}
                </li>
                <li>
                  <strong>Response Rate:</strong> {summary.promotions.response_rate}
                </li>
              </ul>
            </div>
          </div>

          {/* Add similar cards for other metrics */}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SummaryPage;
