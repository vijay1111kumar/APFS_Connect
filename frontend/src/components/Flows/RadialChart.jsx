import React, { useState } from "react";
import ApexCharts from "react-apexcharts";
import Card from "../Common/Card";

// Utility function to format labels
const formatLabel = (label) =>
  label.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const RadialChart = ({ title, aggregatedData, campaignStats }) => {
  const [hoveredCampaignIndex, setHoveredCampaignIndex] = useState(null);

  // Prepare data for radial chart series and labels
  const chartLabels = campaignStats.map((campaign) => campaign.name);
  const chartSeries = campaignStats.map((campaign) =>
    (campaign.stats.messages_delivered/campaign.stats.messages_attempted || 1).toFixed(2) * 100 
  );

  const colorPalette = ["#d9dd92", "#eabe7c", "#dd6031", "#311e10", "#a9b665", "#5c6370"];
  const chartOptions = {
    series: chartSeries,
    colors: colorPalette.slice(0, chartSeries.length), // Use colors dynamically
    chart: {
      height: 380,
      type: "radialBar",
      events: {
        dataPointMouseEnter: (event, chartContext, config) => {
          setHoveredCampaignIndex(config.dataPointIndex);
        },
        dataPointMouseLeave: () => {
          setHoveredCampaignIndex(null); // Reset to aggregated stats
        },
      },
    },
    plotOptions: {
      radialBar: {
        track: { background: "#E5E7EB", margin: 5 },
        dataLabels: {
          name: { show: false },
          value: {
            formatter: (val) => `${val}%`,
            offsetY: 5,
          },
        },
        hollow: {
          margin: 0,
          size: "40%",
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
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    tooltip: { enabled: true },
  };

  const dataToDisplay =
    hoveredCampaignIndex !== null
      ? campaignStats[hoveredCampaignIndex].stats
      : aggregatedData;

  return (
    <div className="min-w-auto max-w-auto bg-white">
      {/* Radial Chart and Cards */}
      <div className="flex flex-col gap-4 border border-gray-200 bg-white p-4 rounded-lg">
        
        {/* Header */}
        <div className="flex justify-between">
          <h5 className="text-lg font-bold text-gray-900">{title}</h5>
        </div>

        <div className="flex lg:flex-row sm:flex-col md:flex-col justify-between gap-4 border border-gray-200 bg-white p-4 rounded-lg">
          {/* Radial Chart */}
          <div className="w-full h-full sm:w-1/2 md:w-full">
            <ApexCharts options={chartOptions} series={chartSeries} type="radialBar" height={380} />
          </div>

          {/* Cards Section */}
          <div className="w-full grid md:grid-cols-2 xl:grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-2">
            {Object.entries(dataToDisplay).map(([key, value]) => (
              <Card key={key} title={formatLabel(key)} current_value={value} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default RadialChart;
