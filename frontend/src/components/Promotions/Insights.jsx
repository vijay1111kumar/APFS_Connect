import React from "react";
import Card from "../Common/Card";

const Insights = ({ totalStats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card title="Total Promotions" value={totalStats.total} current_value={10} />
    <Card title="Active Promotions" value={totalStats.active} current_value={8} />
    <Card title="Scheduled Promotions" value={totalStats.scheduled} current_value={3} />
    <Card title="Completed Promotions" value={totalStats.completed} current_value={5} />
  </div>
);

export default Insights;
