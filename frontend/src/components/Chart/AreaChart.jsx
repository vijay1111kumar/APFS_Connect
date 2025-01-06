import React, { useEffect, useState } from "react";
import ApexCharts from "react-apexcharts";
import { fetchFlowDetail } from "../../utils/api";

const AreaChart = ({ flowId }) => {
  const [fullData, setFullData] = useState({ values: [], dates: [] }); // Complete timeline data
  const [chartData, setChartData] = useState([]); // Filtered data
  const [categories, setCategories] = useState([]); // Filtered categories
  const [title, setTitle] = useState("Loading...");
  const [subtitle, setSubtitle] = useState("Fetching data...");
  const [growthRate, setGrowthRate] = useState(0);
  const [timePeriod, setTimePeriod] = useState("Last 7 days");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasData, setHasData] = useState(true); // Track if data exists

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await fetchFlowDetail(flowId);
        if (!data.values || data.values.length === 0) {
          setHasData(false); // No data available
          setChartData([]);
          setCategories([]);
          setTitle("");
          setSubtitle("");
          setGrowthRate(0);
          return;
        }

        setHasData(true); // Data exists
        setFullData({ values: data.values, dates: data.dates }); // Store complete data
        setTitle(data.title);
        setSubtitle(data.subtitle);
        setGrowthRate(data.growth_rate);

        // Apply the current time period filter
        filterData(timePeriod, data.values, data.dates);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setTitle("");
        setSubtitle("");
        setHasData(false);
      }
    };

    fetchData();
  }, [flowId]); // Fetch data when the promotion changes

  const filterData = (period, values, dates) => {
    if (!values || !dates) return; // Prevent errors when no data is available

    let filteredValues = [];
    let filteredDates = [];
    switch (period) {
      case "Today":
        filteredValues = values.slice(0, 1); // First value (today)
        filteredDates = dates.slice(0, 1);
        break;
      case "Last 3 days":
        filteredValues = values.slice(0, 3); // First 3 values
        filteredDates = dates.slice(0, 3);
        break;
      case "Last 7 days":
        filteredValues = values.slice(0, 7); // First 7 values
        filteredDates = dates.slice(0, 7);
        break;
      case "This Month":
        filteredValues = values.slice(0, 30); // First 30 values
        filteredDates = dates.slice(0, 30);
        break;
      default:
        filteredValues = values;
        filteredDates = dates;
        break;
    }
    setChartData(filteredValues);
    setCategories(filteredDates);
  };

  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
    setDropdownOpen(false);
    filterData(period, fullData.values, fullData.dates); // Apply filter on existing data
  };

  const options = {
    chart: {
      type: "area",
      fontFamily: "Inter, sans-serif",
      dropShadow: { enabled: false },
    toolbar: { show: false },
    },
    tooltip: {
      enabled: true,
      x: { show: false },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: "#DD6031",
        gradientToColors: ["#ECE4B7"],
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 6 },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: { left: 2, right: 2, top: 0 },
    },
    xaxis: {
      categories: categories,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
  };

  const series = [
    {
      name: "Users",
      data: chartData,
      color: "#D9DD92",
    },
  ];

  return (
    <div className="bg-white">
      <div className="flex justify-between">
        <div>
          <h5 className="leading-none text-m font-semibold text-gray-900">{title}</h5>
          <p className="text-base font-normal text-gray-500">{subtitle}</p>
        </div>
        <div
          className={`flex items-center px-2.5 py-0.5 text-base font-semibold ${
            growthRate >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {growthRate}%
          <svg
            className="w-3 h-3 ms-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 14"
            aria-hidden="true"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                growthRate >= 0
                  ? "M5 13V1m0 0L1 5m4-4 4 4"
                  : "M5 1v12m0 0L9 9m-4 4L1 9"
              }
            />
          </svg>
        </div>
      </div>

      {/* Chart or No Results Message */}
      {hasData ? (
        <ApexCharts options={options} series={series} type="area" height={200} />
      ) : (
        <div className="flex items-center justify-center h-48 text-lg font-bold text-gray-500">
          Oops! Sorry no results 🤕
        </div>
      )}

      <div className="grid grid-cols-1 items-center border-t border-gray-200 pt-5">
        <div className="flex justify-between items-center">
          {/* Dropdown for time period */}
          <div className="relative">
            <button
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {timePeriod}
              <svg
                className="w-2.5 h-2.5 ms-1.5 inline-block"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
                aria-hidden="true"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded shadow w-40">
                <ul className="py-2 text-sm text-gray-700">
                  {["Today", "Last 3 days", "Last 7 days", "This Month"].map((period) => (
                    <li key={period}>
                      <button
                        className={`block px-4 py-2 hover:bg-gray-100 w-full text-left ${
                          period === timePeriod ? "font-bold text-highlight" : ""
                        }`}
                        onClick={() => handleTimePeriodChange(period)}
                      >
                        {period}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <a
            href="#"
            className="uppercase text-sm font-semibold inline-flex items-center text-primary hover:text-highlight"
          >
            View Report
            <svg
              className="w-2.5 h-2.5 ms-1.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
              aria-hidden="true"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AreaChart;
