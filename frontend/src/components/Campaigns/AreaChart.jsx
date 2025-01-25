import React, { useState } from "react";
import ApexCharts from "react-apexcharts";

const AreaChart = ({ title, subtitle, data, metrics, jobs }) => {
  const [selectedMetric, setSelectedMetric] = useState("flow_completed"); // Default metric
  const [selectedJob, setSelectedJob] = useState("All"); // Default job
  const [dropdownOpenMetric, setDropdownOpenMetric] = useState(false);
  const [dropdownOpenJob, setDropdownOpenJob] = useState(false);

  // Filter data based on the selected campaign job
  const filterDataByJob = (jobId) => {
    return jobId === "All" ? data : data.filter((item) => item.id === jobId);
  };

  const filteredData = filterDataByJob(selectedJob);

  // Prepare chart series based on selected metric
  const chartData = [
    {
      name: metrics[selectedMetric],
      data: filteredData.map((job) => job.metrics[selectedMetric] || 0),
      color: "#D9DD92",
    },
  ];

  // Prepare x-axis categories based on job schedule time
  const categories = filteredData.map((job) =>
    new Date(job.schedule_time).toLocaleString()
  );

  const options = {
    chart: {
      type: "area",
      fontFamily: "Inter, sans-serif",
      dropShadow: { enabled: false },
      toolbar: { show: false },
    },
    tooltip: {
      enabled: true,
      x: { show: true },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: "#D0E37F",
        gradientToColors: ["#D0E37F"],
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 6 },
    grid: {
      show: true,
      strokeDashArray: 4,
      padding: { left: 2, right: 2, top: 0 },
    },
    xaxis: {
      categories: categories,
      labels: { show: true },
      axisBorder: { show: false },
      axisTicks: { show: false },
      title: { text: "Campaign Jobs", style: { fontWeight: 600 } },
    },
    yaxis: {
      labels: { show: true, itemMargin: { horizontal: 200 }  },
      title: { text: metrics[selectedMetric], style: { fontWeight: 600 } },
    },
  };

  return (
    <div className="bg-white p-6 rounded">
      <div className="flex justify-between items-center">

        <div>
          <h5 className="leading-none text-m font-semibold text-gray-900">{title}</h5>
          <p className="text-base font-normal text-gray-500">{subtitle}</p>
        </div>

              <div className="chartControls flex gap-4">
                <select
                  className="rounded border-gray-300 px-3 py-2 text-sm"
                  value={selectedMetric}
                  onChange={(e) => {setSelectedMetric(e.target.value); setDropdownOpenMetric(false);}}
                >
                 {Object.keys(metrics).map((key) => (
                  <option id={key} value={key}>{metrics[key]}</option>
                 ))}
                </select>
        
                <select
                  className="rounded border-gray-300 px-3 py-2 text-sm"
                  value={selectedJob || ""}
                  onChange={(e) => setSelectedJob(e.target.value || "All")} // Reset to all Flows if no ID selected
                >
                  <option value="">All Jobs</option>
                  {jobs.map((job) => (
                    <option key={job} value={job}>
                      {job}
                    </option>
                  ))}
                </select>
              </div>

      </div>

      {/* Chart or No Data */}
      {filteredData.length > 0 ? (
        <ApexCharts options={options} series={chartData} type="area" height={400} />
      ) : (
        <div className="flex items-center justify-center h-48 text-lg font-bold text-gray-500">
          Oops! No metrics available 🤕
        </div>
      )}
    </div>
  );
};

export default AreaChart;
