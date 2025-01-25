import React, { useState, useEffect } from "react";
import ColumnChart from "../Chart/ColumnChart";

const PerformanceChart = ({ fetchPromotionsPerformance }) => {
  const [selectedId, setSelectedId] = useState(null); // Selected promotion ID
  const [timePeriod, setTimePeriod] = useState("7days"); // Default timeframe
  const [allData, setAllData] = useState(null); // Data for all promotions
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
        const data = await fetchPromotionsPerformance();
        setAllData(data);
        
        const dropdownRecords = Object.entries(data).map(([id, promotion]) => ({
          id,
          name: promotion.name,
        }));
        setRecords(dropdownRecords);
        setChartData(formatChartData(data, timePeriod));

      } catch (error) {
        console.error("Error fetching performance data:", error);
      }
    };

    fetchData();
  }, [fetchPromotionsPerformance]);

  useEffect(() => {
    if (allData) {
      // Update the chart data when timeframe or selected promotion changes
      const filteredData = selectedId
        ? { [selectedId]: allData[selectedId] }
        : allData; // Filter for the selected promotion or show all
      setChartData(formatChartData(filteredData, timePeriod));
    }
  }, [selectedId, timePeriod, allData]);

  const formatChartData = (data, period) => {
    const categories = Array.from(
      new Set(
        Object.values(data).flatMap((promotion) =>
          filterByTimePeriod(promotion.values, period).map((item) => item.date)
        )
      )
    ); // Extract unique dates across promotions

    const series = Object.entries(data).map(([promotionId, promotion]) => ({
      name: promotion.name,
      data: filterByTimePeriod(promotion.values, period).map((item) => item.value),
    }));

    return { categories, series };
  };

  return (
    <div className="p-4 m-2 hidden lg:block md:block sm:block bg-white rounded-md border-2 border-gray-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl text-primary font-bold">Performance Chart</h3>

      <div className="chartControls flex lg:flex-row flex-col gap-4">
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
          className="border-2 rounded-md border-gray-300 px-3 py-2 text-sm"
          value={selectedId || ""}
          onChange={(e) => setSelectedId(e.target.value || null)} // Reset to all promotions if no ID selected
        >
          <option value="">All Promotions</option>
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
          title={selectedId ? `Performance for ${records.find((rec) => rec.id === selectedId)?.name}` : "All Promotions"}
          subtitle={`Time Period: ${timePeriod}`}
        />
      )}

    </div>
  );
};

export default PerformanceChart;
