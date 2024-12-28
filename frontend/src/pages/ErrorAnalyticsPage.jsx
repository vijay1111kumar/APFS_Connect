import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { fetchErrorFailures } from "../utils/api";
import Chart from "react-apexcharts"; // Import ApexCharts

const ErrorAnalyticsPage = () => {
  const [errorData, setErrorData] = useState(null);

  useEffect(() => {
    const getErrorFailuresData = async () => {
      try {
        const { data } = await fetchErrorFailures();
        setErrorData(data);
      } catch (error) {
        console.error("Error fetching error analytics data:", error);
      }
    };

    getErrorFailuresData();
  }, []);

  if (!errorData) return <div className="text-text">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ backgroundColor: 'theme("colors.background")' }}>
        <h2 className="text-3xl font-bold text-text">Error and Failure Analytics</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Delivery Failures */}
          <div
            className="block rounded-lg shadow-lg p-6 border"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">Message Delivery Failures</h3>
            <Chart
              type="pie"
              height={250}
              options={{
                chart: { id: "delivery-failures" },
                labels: Object.keys(errorData.delivery_failures),
                colors: ["#F77F00", "#F4A261", "#2A9D8F"],
              }}
              series={Object.values(errorData.delivery_failures)}
            />
          </div>

          {/* Failed Flows */}
          <div
            className="block rounded-lg shadow-lg p-6 border"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">Failed Flows</h3>
            <p className="text-4xl font-bold" style={{ color: 'theme("colors.highlight")' }}>
              {errorData.failed_flows}
            </p>
          </div>

          {/* Scheduler Failures */}
          <div
            className="block rounded-lg shadow-lg p-6 border"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">Scheduler Failures</h3>
            <p className="text-4xl font-bold" style={{ color: 'theme("colors.highlight")' }}>
              {errorData.scheduler_failures}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ErrorAnalyticsPage;
