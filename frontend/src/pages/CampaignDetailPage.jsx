import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useParams } from "react-router-dom";
import DetailList from "../components/Common/DetailList";
import Header from "../components/Common/Header";
import AreaChart from "../components/Chart/AreaChart"; // Custom Area Chart Component
import Insights from "../components/Common/Insights";
import Timeline from "../components/Common/Timeline"; // Custom Timeline Component
import { 
  fetchCampaignDetails, 
  fetchCampaignMetrics, 
  fetchCampaignJobs 
} from "../utils/api";

const CampaignDetailPage = () => {
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [campaignMetrics, setCampaignMetrics] = useState([]);
  const [aggregatedData, setAggregatedData] = useState(null);
  const [scheduledJobs, setScheduledJobs] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch campaign details
        const campaign = await fetchCampaignDetails(id);
        setCampaignDetails(campaign);

        // Fetch campaign jobs (runs)
        const jobs = await fetchCampaignJobs(id);
        setScheduledJobs(jobs);

        // Fetch metrics for each campaign run
        const metricsPromises = jobs.map(async (job) => {
          const metrics = await fetchCampaignMetrics(job.id);
          return {
            jobId: job.id,
            scheduleTime: job.schedule_time,
            ...metrics,
          };
        });
        const metrics = await Promise.all(metricsPromises);
        setCampaignMetrics(metrics);

        // Aggregate data
        const aggregated = metrics.reduce((acc, curr) => {
          acc.total_users_targeted += curr.total_users_targeted || 0;
          acc.messages_attempted += curr.messages_attempted || 0;
          acc.messages_delivered += curr.messages_delivered || 0;
          acc.messages_failed += curr.messages_failed || 0;
          acc.flow_completed += curr.flow_completed || 0;
          acc.flow_cutoffs += curr.flow_cutoffs || 0;
          return acc;
        }, {
          total_users_targeted: 0,
          messages_attempted: 0,
          messages_delivered: 0,
          messages_failed: 0,
          flow_completed: 0,
          flow_cutoffs: 0,
        });
        setAggregatedData(aggregated);
      } catch (error) {
        console.error("Error fetching campaign details:", error);
      }
    };

    fetchDetails();
  }, [id]);

  if (!campaignDetails || !aggregatedData || !campaignMetrics) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-bold">Loading...</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 rounded-lg border border-gray-200 bg-white">
        {/* Header Section */}
        <Header
          title={campaignDetails.name}
          description={`Scheduled at: ${campaignDetails.schedule_at}`}
          buttonText="Re-Run"
        />

        {/* Detail & Insights Section */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6">
          {/* Campaign Details */}
          <DetailList title="Campaign Details" data={campaignDetails} />

          {/* Performance Insights */}
          <div className="lg:col-span-2 sm:col-span-1">
            <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
            <AreaChart
              data={campaignMetrics.map((metric) => ({
                name: new Date(metric.scheduleTime).toLocaleString(),
                value: metric.flow_completed,
              }))}
              title="Campaign Run Metrics"
              xLabel="Runs"
              yLabel="Completed Flows"
            />
          </div>
        </div>

        {/* Timeline Section */}
        <div className="p-6 rounded-lg border border-gray-200 bg-white">
          <h3 className="text-lg font-bold mb-4">Campaign Timeline</h3>
          <Timeline
            data={scheduledJobs.map((job) => ({
              time: job.schedule_time,
              status: job.status,
              id: job.id,
            }))}
          />
        </div>

        {/* Insights Section */}
        <div className="p-6 rounded-lg border border-gray-200 bg-white">
          <h3 className="text-lg font-bold mb-4">Aggregated Insights</h3>
          <Insights totalStats={aggregatedData} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CampaignDetailPage;
