import React from "react";
import Card from "../Common/Card";

const Insights = ({ totalStats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card title="Total" value={totalStats.total} current_value={totalStats.total} />
    <Card title="Active" value={totalStats.active} current_value={totalStats.active} />
    <Card title="Scheduled" value={totalStats.scheduled} current_value={totalStats.scheduled} />
    <Card title="Completed" value={totalStats.completed} current_value={totalStats.completed} />
  </div>
);

export default Insights;
