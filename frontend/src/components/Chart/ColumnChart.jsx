import React from "react";
import ApexCharts from "react-apexcharts";

const ColumnChart = ({ data, title = "Leads Generated", subtitle = "Per Week" }) => {
  // Extract series and categories from the data
  const series = data.series;
  const categories = data.categories;

  const options = {
    colors: ["#3f4739","#d0e37f", "#b8b08d", "#202c39", "#283845",  "#f2d492", "#f29559", "#d1603d", "#ddb967", "#717568"],
    chart: {
      type: "bar",
      height: "320px",
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "90%",
        borderRadiusApplication: "end",
        borderRadius: 6,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      style: {
        fontFamily: "Inter, sans-serif",
      },
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 2,
        },
      },
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["transparent"],
    },
    grid: {
      show: true,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: -14,
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: categories,
      floating: false,
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: true,
    },
    fill: {
      opacity: 0.9,
    },
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-2 ">

      {/* Chart */}
      <div id="column-chart">
        <ApexCharts options={options} series={series} type="bar" height={320} />
      </div>
    </div>
  );
};

export default ColumnChart;
