import React from "react";
import ApexCharts from "react-apexcharts";
import Card from "../Common/Card";

// Utility function to format labels
const formatLabel = (label) =>
  label.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const RadialChart = ({ title, data }) => {
  const total = data.total || 1;

  // Prepare filtered data and calculate percentages
  const filteredData = Object.entries(data)
    .filter(([key]) => key !== "total")
    .map(([key, value]) => ({
      label: formatLabel(key), // Replace underscores and format to title case
      value,
      percentage_value: ((value / total) * 100).toFixed(2), // Calculate percentage
    }));

  // Extract chart series (angles) and labels
  const chartSeries = filteredData.map((item) => Number(item.percentage_value));
  const chartLabels = filteredData.map((item) => item.label);

  // Updated color palette
  const colorPalette = ["#d9dd92", "#eabe7c", "#dd6031", "#311e10"];

  // Chart options
  const chartOptions = {
    series: chartSeries,
    colors: colorPalette.slice(0, chartSeries.length), // Use colors dynamically based on the number of series
    chart: {
      height: 380, // Larger radial circles
      type: "radialBar",
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        track: { background: "#E5E7EB", margin: 5 }, // Add spacing between segments
        dataLabels: {
          name: { show: false },
          value: {
            formatter: (val) => `${val}%`, // Display percentage in center
            offsetY: 5, // Adjust position to avoid overlap
          },
        },
        hollow: {
          margin: 0,
          size: "40%", // Bigger hollow size to ensure clear spacing
        },
        stroke: {
          lineCap: "round",
        },
      },
    },
    labels: chartLabels,
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Inter, sans-serif",
      itemMargin: { horizontal: 10, vertical: 5 }, // Add spacing between legend items
    },
    tooltip: { enabled: true },
  };

  return (
        <div className="min-w-auto max-w-auto bg-white">

            {/* Radial Chart and Cards */}
            <div className="flex flex-col gap-4 border border-gray-200 bg-white p-4 rounded-lg">
                <div className="flex justify-between">
                    <h5 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h5>
                </div>

                <div className="flex lg:flex-col md:flex-row justify-between gap-4 border border-gray-200 bg-white p-4 rounded-lg ">
                    
                    {/* Radial Chart */}
                    <div className="w-full h-full sm:w-1/2 md:w-full" >
                        <ApexCharts options={chartOptions} series={chartSeries} type="radialBar" height={380} />
                    </div>

                    {/* Cards Section */}
                    <div className="w-full grid  md:grid-cols-1  xl:grid-cols-2 gap-4 sm:grid-cols-1 sm:gap-2">
                        {filteredData.map(({ label, value }) => (
                        <Card key={label} title={label} current_value={value} />
                        ))}
                    </div>

                </div>
            </div>
    </div>

  );
};

export default RadialChart;
