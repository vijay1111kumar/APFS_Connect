import React, { useEffect, useState } from "react";
import {
  fetchFlowDetails,
  fetchPromotionsWithFlow,
  fetchRemaindersWithFlow,
  fetchCampaignMetrics,
  fetchCampaignsWithFlow
} from "../utils/api";

import DashboardLayout from "../components/Layout/DashboardLayout";
import { useParams } from "react-router-dom";
import DetailList from "../components/Common/DetailList";
import Header from "../components/Common/Header";
import RadialChart from "../components/Flows/RadialChart";
import CampaignDetailsTable from "../components/Flows/CampaignDetailsTable";

const FlowDetailPage = () => {
  const [flowDetails, setFlowDetails] = useState(null);
  const [campaignsStats, setCampaignsStats] = useState([]);
  const [linkedPromotions, setLinkedPromotions] = useState([]);
  const [linkedRemainders, setLinkedRemainders] = useState([]);
  const [aggregatedData, setAggregatedData] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch flow details
        const flow = await fetchFlowDetails(id);
        setFlowDetails({
          Name: flow.name,
          Trigger: flow.trigger,
          "Is Active": flow.is_active ? "Yes" : "No",
          "Created By": flow.created_by,
          "Created At": new Date(flow.created_at).toLocaleString(),
          "Modified By": flow.modified_by || "N/A",
          "Modified At": flow.modified_at
            ? new Date(flow.modified_at).toLocaleString()
            : "N/A",
          "Flow File": flow.flow_file,
        });

        // Fetch campaigns linked to the flow
        const campaigns = await fetchCampaignsWithFlow(id);
        const campaignMetricsPromises = campaigns.map(async (campaign) => {
          const metrics = await fetchCampaignMetrics(campaign.id);
          return {
            name: campaign.name,
            stats: {
              total_users_targeted: metrics.total_users_targeted || 0,
              messages_attempted: metrics.messages_attempted || 0,
              messages_unread: metrics.messages_unread || 0,
              flow_completed: metrics.flow_completed || 0,
              messages_delivered: metrics.messages_delivered || 0,
              messages_failed: metrics.messages_failed || 0,
            },
          };
        });

        const campaignStats = await Promise.all(campaignMetricsPromises);
        setCampaignsStats(campaignStats);
        console.log(campaignStats)

        const linkedPromotions = await fetchPromotionsWithFlow(id);
        setLinkedPromotions(linkedPromotions);
        console.log(linkedPromotions)

        const linkedRemainders = await fetchRemaindersWithFlow(id);
        setLinkedRemainders(linkedRemainders);

        // Calculate aggregated data
        const aggregated = campaignStats.reduce((acc, campaign) => {
          Object.entries(campaign.stats).forEach(([key, value]) => {
            acc[key] = (acc[key] || 0) + value;
          });
          return acc;
        }, {});
        setAggregatedData(aggregated);
      } catch (error) {
        console.error("Error fetching flow details:", error);
      }
    };

    fetchDetails();
  }, [id]);

  if (!flowDetails || !aggregatedData) {
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
        <Header
          title={flowDetails.Name}
          description="Detailed insights into the flow and related campaigns."
        />
        <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6">
          <DetailList title="Flow Details" data={flowDetails} />
          <div className="sm:col-span-2 lg:col-span-2">
            <RadialChart
              title="Campaign Performance"
              aggregatedData={aggregatedData}
              campaignStats={campaignsStats}
            />
          </div>
        </div>

        <CampaignDetailsTable campaigns={campaignsStats} />
        {/* <CampaignDetailsTable campaigns={linkedRemainders} />
        <CampaignDetailsTable campaigns={linkedRemainders} /> */}
        {/* <DetailList data={linkedRemainders} />
        <DetailList data={linkedPromotions} /> */}
        {/* <Table title="Linked Promotions" data={linkedPromotions} /> */}
      </div>
    </DashboardLayout>
  );
};

export default FlowDetailPage;
