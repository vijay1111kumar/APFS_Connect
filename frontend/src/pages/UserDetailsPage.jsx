import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { fetchUserStats } from "../utils/api";
import Chart from "react-apexcharts"; // Import ApexCharts

const UserDetailsPage = () => {
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    const getUserStatsData = async () => {
      try {
        const { data } = await fetchUserStats();
        setUserStats(data);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    getUserStatsData();
  }, []);

  if (!userStats) return <div className="text-text">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ backgroundColor: 'theme("colors.background")' }}>
        <h2 className="text-3xl font-bold text-text">User Engagement Analytics</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Message Engagement */}
          <div
            className="block rounded-lg shadow-lg p-6 border"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">Message Engagement</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="font-medium text-text">Messages Sent:</span> {userStats.engagement.messages_sent}
              </li>
              <li>
                <span className="font-medium text-text">Messages Read:</span> {userStats.engagement.messages_read}
              </li>
              <li>
                <span className="font-medium text-text">Reply Percentage:</span> {userStats.engagement.reply_percentage}
              </li>
            </ul>
          </div>

          {/* User Activity */}
          <div
            className="block rounded-lg shadow-lg p-6 border"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">User Activity</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="font-medium text-text">Active Users:</span> {userStats.activity.active_users}
              </li>
              <li>
                <span className="font-medium text-text">Inactive Users:</span> {userStats.activity.inactive_users}
              </li>
            </ul>
          </div>

          {/* Flow Completion Metrics */}
          <div
            className="block rounded-lg shadow-lg p-6 border col-span-2"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">Flow Completion Metrics</h3>
            <Chart
              type="bar"
              height={250}
              options={{
                chart: { id: "drop-off-steps" },
                xaxis: {
                  categories: Object.keys(userStats.flow_completion.drop_off_steps),
                },
                colors: ["theme('colors.highlight')"],
              }}
              series={[
                {
                  name: "Drop-Offs",
                  data: Object.values(userStats.flow_completion.drop_off_steps),
                },
              ]}
            />
          </div>

          {/* User Retention */}
          <div
            className="block rounded-lg shadow-lg p-6 border"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">User Retention</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <span className="font-medium text-text">Returning Users:</span> {userStats.retention.returning_users}
              </li>
              <li>
                <span className="font-medium text-text">Churned Users:</span> {userStats.retention.churned_users}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetailsPage;
