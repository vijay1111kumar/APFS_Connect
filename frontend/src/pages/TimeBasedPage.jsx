import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { fetchTimeBased } from "../utils/api";
import Chart from "react-apexcharts"; // Import ApexCharts

const TimeBasedPage = () => {
  const [timeData, setTimeData] = useState(null);

  useEffect(() => {
    const getTimeBasedData = async () => {
      try {
        const { data } = await fetchTimeBased();
        setTimeData(data);
      } catch (error) {
        console.error("Error fetching time-based data:", error);
      }
    };

    getTimeBasedData();
  }, []);

  if (!timeData) return <div className="text-text">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ backgroundColor: 'theme("colors.background")' }}>
        <h2 className="text-3xl font-bold text-text">Time-Based Insights</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Trends */}
          <div
            className="block rounded-lg shadow-lg p-6 border"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">Hourly Trends</h3>
            <Chart
              type="bar"
              height={250}
              options={{
                chart: { id: "hourly-trends" },
                xaxis: { categories: timeData.hourly_trends.hours },
                colors: ["theme('colors.highlight')"],
              }}
              series={[
                {
                  name: "Interactions",
                  data: timeData.hourly_trends.interactions,
                },
              ]}
            />
          </div>

          {/* Weekly Trends */}
          <div
            className="block rounded-lg shadow-lg p-6 border"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">Weekly Trends</h3>
            <Chart
              type="line"
              height={250}
              options={{
                chart: { id: "weekly-trends" },
                xaxis: { categories: timeData.weekly_trends.days },
                colors: ["theme('colors.highlight')"],
              }}
              series={[
                {
                  name: "Interactions",
                  data: timeData.weekly_trends.interactions,
                },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Average Delivery Time */}
          <div
            className="block rounded-lg shadow-lg p-6 border"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">Average Delivery Time</h3>
            <p className="text-2xl font-bold" style={{ color: 'theme("colors.highlight")' }}>
              {timeData.message_delivery.average_delivery_time}
            </p>
          </div>

          {/* Retry Success Trends */}
          <div
            className="block rounded-lg shadow-lg p-6 border"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">Retry Success Trends</h3>
            <ul className="mt-4 space-y-2">
              {Object.entries(timeData.message_delivery.retry_success).map(([time, count]) => (
                <li key={time} className="flex justify-between">
                  <span className="font-medium text-text">{time}:</span>
                  <span className="font-bold text-text">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TimeBasedPage;
