import React from "react";
import ApexCharts from "react-apexcharts";

const ColumnChart = ({ data, title, subtitle }) => {
  const series = data.series;
  const categories = data.categories;

  

  const options = {
    colors: ["#202c39", "#283845", "#b8b08d", "#f2d492", "#f29559", "#d1603d", "#ddb967", "#d0e37f", "#717568", "#3f4739"],
    // colors: ["#202c39", "#283845", "#b8b08d", "#f2d492", "#f29559"],
    // colors: ["#1A56DB", "#FDBA8C", "#D9DD92", "#EABE7C", "#DD6031", "#311E10"],
    chart: {
      type: "bar",
      stacked: true, // Enable stacked bars
      height: "320px",
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadiusApplication: "end",
        borderRadius: 4,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => val.toLocaleString(),
      },
    },
    states: {
      hover: {
        filter: {
          type: "darken",
          value: 1,
        },
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        show: true,
        style: {
          fontFamily: "Inter, sans-serif",
          cssClass: "text-xs font-normal fill-gray-500 dark:fill-gray-400",
        },
      },
    },
    yaxis: {
      show: true,
      labels: {
        formatter: (val) => val.toLocaleString(),
      },
    },
    fill: {
      opacity: 0.9,
    },
    legend: {
      show: true,
      position: "top",
    },
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 p-2">
      <div className="mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <ApexCharts options={options} series={series} type="bar" height={320} />
    </div>
  );
};

export default ColumnChart;
