import React from 'react';
import Chart from 'react-apexcharts';

const ApexChart = () => {
    const options = {
        chart: {
            id: "basic-bar"
        },
        xaxis: {
            categories: ["Jan", "Feb", "Mar", "Apr", "May"]
        }
    };

    const series = [
        {
            name: "Sales",
            data: [30, 40, 35, 50, 49]
        }
    ];

    return <Chart options={options} series={series} type="bar" height={320} />;
};

export default ApexChart;
