import React from "react";
import AreaChart from "./AreaChart";

const CampaignMetricsChart = ({ campaignJobStats }) => {
  // Extract job IDs
  const jobIds = campaignJobStats.map((job) => job.id);

  // Define metrics available for filtering
  const metrics = {
    total_users_targeted: "Total Users Targeted",
    messages_attempted: "Messages Attempted",
    messages_failed: "Messages Failed",
    messages_delivered: "Messages Delivered",
    messages_unread: "Messages Unread",
    flow_completed: "Flows Completed",
    flow_cutoffs: "Flow Cutoffs",
  };

  return (
    <div className="p-6 rounded-lg border border-gray-200 bg-white">
      <h3 className="text-lg font-semibold mb-4">Campaign Job Metrics Timeline</h3>
      <AreaChart
        data={campaignJobStats} // Pass the stats directly
        metrics={metrics} // Metrics for filtering
        jobs={jobIds} // List of job IDs for filtering
      />
    </div>
  );
};

export default CampaignMetricsChart;
