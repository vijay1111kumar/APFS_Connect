import React from "react";
import ApexCharts from "react-apexcharts";

const DonutChart = ({ title, data }) => {
  // Ensure data is valid and process it
  const isDataValid = Array.isArray(data) && data.length > 0;
  const labels = isDataValid
    ? data.map((item) => item.label)
    : ["No Data Available"];
  const series = isDataValid
    ? data.map((item) =>
        Math.round((item.stepsCompleted / item.totalSteps) * 100)
      )
    : [100];

  const totalFlows = isDataValid
    ? data.reduce((sum, item) => sum + item.totalSteps, 0)
    : 1; // Prevent division by zero
  const completedFlows = isDataValid
    ? data.reduce((sum, item) => sum + item.stepsCompleted, 0)
    : 0;

    

  // Chart configuration
  const chartOptions = {
    series,
    colors: ["#d9dd92", "#eabe7c", "#dd6031", "#311e10"],
    chart: {
      height: 380,
      type: "donut",
        events: {
          dataPointSelection: (event, chartContext, config) => { 
            if (
              config?.dataPointIndex !== undefined &&
              config?.w?.config?.series &&
              config?.w?.config?.labels
            ) {
              const hoveredValue = config.w.config.series[config.dataPointIndex] || 0;
              const hoveredLabel = config.w.config.labels[config.dataPointIndex] || "N/A";
              chartContext.updateOptions({
                plotOptions: {
                  pie: {
                    donut: {
                      labels: {
                        total: {
                          label: hoveredLabel,
                          formatter: () => `${hoveredValue}%`,
                        },
                      },
                    },
                  },
                },
              });
            }
          },
      },
      
    },
    stroke: {
      colors: ["transparent"],
      lineCap: "round",
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontFamily: "Inter, sans-serif",
              offsetY: 20,
            },
            total: {
              showAlways: true,
              show: true,
              label: `Completed Flows: (${completedFlows}/${totalFlows})`,
              fontFamily: "Inter, sans-serif",
              formatter: () =>
                `${Math.round((completedFlows / totalFlows) * 100)}%`,
            },
            value: {
              show: true,
              fontFamily: "Inter, sans-serif",
              color: "gray",
              offsetY: -20,
              formatter: (value) => `${value}%`,
            },
          },
          size: "80%",
        },
      },
    },
    grid: {
      padding: {
        top: -2,
      },
    },
    labels,
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "bottom",
      fontFamily: "Inter, sans-serif",
    },
    tooltip: { enabled: true },
  };

  return (
    <div className="flex justify-center items-center w-full p-4 md:p-6">
      <ApexCharts options={chartOptions} series={series} type="donut" height={380} />
    </div>
  );
};

export default DonutChart;
