import React, { useState, useEffect } from "react";
import ColumnChart from "../Chart/ColumnChart";

const PerformanceChart = ({ fetchFlowsPerformance }) => {
  const [selectedId, setSelectedId] = useState(null); // Selected flow ID
  const [timePeriod, setTimePeriod] = useState("7days"); // Default timeframe
  const [allData, setAllData] = useState(null); // Data for all Flows
  const [chartData, setChartData] = useState(null); // Data for the current view
  const [records, setRecords] = useState([]); // Records list to populate the dropdown

  // Helper function to slice data for selected timeframe
  const filterByTimePeriod = (data, period) => {
    const days = period === "today" ? 1 : period === "3days" ? 3 : period === "7days" ? 7 : 30;
    return data.slice(0, days);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchFlowsPerformance();
        setAllData(data);
        
        const dropdownRecords = Object.entries(data).map(([id, flow]) => ({
          id,
          name: flow.name,
        }));
        setRecords(dropdownRecords);
        setChartData(formatChartData(data, timePeriod));

      } catch (error) {
        console.error("Error fetching performance data:", error);
      }
    };

    fetchData();
  }, [fetchFlowsPerformance]);

  useEffect(() => {
    if (allData) {
      // Update the chart data when timeframe or selected flow changes
      const filteredData = selectedId
        ? { [selectedId]: allData[selectedId] }
        : allData; // Filter for the selected flow or show all
      setChartData(formatChartData(filteredData, timePeriod));
    }
  }, [selectedId, timePeriod, allData]);

  const formatChartData = (data, period) => {
    const categories = Array.from(
      new Set(
        Object.values(data).flatMap((flow) =>
          filterByTimePeriod(flow.values, period).map((item) => item.date)
        )
      )
    ); // Extract unique dates across Flows

    const series = Object.entries(data).map(([flowId, flow]) => ({
      name: flow.name,
      data: filterByTimePeriod(flow.values, period).map((item) => item.value),
    }));

    return { categories, series };
  };

  return (
    <div className="p-4 m-2 sm:min-w-fit bg-white rounded-md border-2 border-gray-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl sm:text-xl text-primary font-bold ml-4">Performance Chart</h3>

      <div className="chartControls flex lg:flex-row md:flex-col sm:flex-col gap-4">
        <select
          className="border-2 rounded-md border-gray-300 px-3 py-2 text-sm focus:ring-focus focus:border-focus "
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="3days">Last 3 Days</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last Month</option>
        </select>

        <select
          className="border-2 rounded-md border-gray-300 px-3 py-2 text-sm focus:ring-focus focus:border-focus "
          value={selectedId || ""}
          onChange={(e) => setSelectedId(e.target.value || null)} // Reset to all Flows if no ID selected
        >
          <option value="">All Flows</option>
          {records.map((record) => (
            <option key={record.id} value={record.id}>
              {record.name}
            </option>
          ))}
        </select>
      </div>

      </div>
      <div className="flex items-center justify-between mb-4">
      </div>
      {chartData && (
        <ColumnChart
          data={chartData}
          title={selectedId ? `Performance for ${records.find((rec) => rec.id === selectedId)?.name}` : "All Flows"}
          subtitle={`Time Period: ${timePeriod}`}
        />
      )}

    </div>
  );
};

export default PerformanceChart;
