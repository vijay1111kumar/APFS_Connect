import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import Header from "../components/Common/Header";
import CampaignMetricsChart from "../components/Campaigns/CampaignMetricsChart";
import { fetchCampaignDetails, fetchCampaignMetrics, fetchCampaignJobs } from "../utils/api";
import { useParams } from "react-router-dom";

const CampaignDetailPage = () => {
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [campaignJobStats, setCampaignJobStats] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch campaign details
        const campaign = await fetchCampaignDetails(id);
        setCampaignDetails(campaign);

        // Fetch campaign jobs and metrics
        const jobStats = await fetchCampaignJobs(id);

        console.log(jobStats)
        setCampaignJobStats(jobStats);
      } catch (error) {
        console.error("Error fetching campaign details or metrics:", error);
      }
    };

    fetchDetails();
  }, [id]);

  if (!campaignDetails || !campaignJobStats.length) {
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
        />

        {/* Area Chart */}
        <CampaignMetricsChart campaignJobStats={campaignJobStats} />

      </div>
    </DashboardLayout>
  );
};

export default CampaignDetailPage;
