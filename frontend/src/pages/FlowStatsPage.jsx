import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { fetchFlowStats } from "../utils/api";
import Chart from "react-apexcharts"; // Import ApexCharts

const FlowStatsPage = () => {
  const [flows, setFlows] = useState(null);

  useEffect(() => {
    const getFlowStatsData = async () => {
      try {
        const { data } = await fetchFlowStats();
        setFlows(data);
      } catch (error) {
        console.error("Error fetching flow stats:", error);
      }
    };

    getFlowStatsData();
  }, []);

  if (!flows) return <div className="text-text">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ backgroundColor: 'theme("colors.background")' }}>
        <h2 className="text-3xl font-bold text-text">Flow Stats Analytics</h2>

        <div className="space-y-6">
          {flows.map((flow) => (
            <div
              key={flow.flow_id}
              className="block rounded-lg shadow-lg p-6 border"
              style={{
                backgroundColor: 'theme("colors.primary")',
                borderColor: 'theme("colors.highlight")',
              }}
            >
              <h3 className="text-xl font-semibold text-text">{flow.name}</h3>
              <p className="mt-2">
                <span className="font-medium text-text">Completion Rate:</span>{" "}
                <span className="font-bold" style={{ color: 'theme("colors.highlight")' }}>
                  {flow.completion_rate}
                </span>
              </p>
              <div className="mt-4">
                <h4 className="text-lg font-semibold text-text">Drop-Off Points</h4>
                <Chart
                  type="bar"
                  height={250}
                  options={{
                    chart: { id: `${flow.flow_id}-drop-off` },
                    xaxis: { categories: Object.keys(flow.drop_off_steps) },
                    colors: ["theme('colors.highlight')"],
                  }}
                  series={[
                    {
                      name: "Drop-Offs",
                      data: Object.values(flow.drop_off_steps),
                    },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FlowStatsPage;
