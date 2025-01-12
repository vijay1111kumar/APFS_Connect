import React, { useEffect, useState } from "react";
import { fetchPromotionDetails, fetchPromotionUsers, fetchCampaignsForPromotion, fetchCampaignMetrics } from "../utils/api";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useParams } from "react-router-dom";
import DetailList from "../components/Common/DetailList";
import Header from "../components/Common/Header";
import RadialChart from "../components/Chart/RadialChart";
import UserDetailsTable from "../components/Promotions/UserDetailsTable";

const PromotionsDetailsPage = () => {
  const [promotionDetails, setPromotionDetails] = useState(null);
  const [flowDetails, setFlowDetails] = useState(null);
  const [users, setUsers] = useState([]);
  const [campaignsStats, setCampaignsStats] = useState([]);
  const [aggregatedData, setAggregatedData] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const promotion = await fetchPromotionDetails(id);
        setPromotionDetails(promotion);

        // Fetch flow details dynamically
        const flowDetails = {
          name: promotion.flow_name,
          description: promotion.flow_description || "No description available",
          isActive: promotion.flow_is_active ? "Yes" : "No",
          trigger: promotion.flow_trigger,
          createdBy: promotion.flow_created_by,
          createdAt: promotion.flow_created_at,
        };
        setFlowDetails(flowDetails);

        // Fetch campaigns linked to the promotion
        const campaigns = await fetchCampaignsForPromotion(id);
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

        // Calculate aggregated data
        const aggregated = campaignStats.reduce((acc, campaign) => {
          Object.entries(campaign.stats).forEach(([key, value]) => {
            acc[key] = (acc[key] || 0) + value;
          });
          return acc;
        }, {});
        setAggregatedData(aggregated);

        // Fetch promotion users
        const userDetails = await fetchPromotionUsers(id);
        setUsers(userDetails);
      } catch (error) {
        console.error("Error fetching promotion details:", error);
      }
    };

    fetchDetails();
  }, [id]);

  if (!promotionDetails || !flowDetails || !aggregatedData) {
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
          title={promotionDetails.name}
          description={promotionDetails.description || "No description available."}
          buttonText="Re-Run"
        />
        <div className="grid lg:grid-cols-3 md:grid-cols-2 md:col-span-full sm:grid-cols-1 gap-6">
          <DetailList title="Promotion Details" data={promotionDetails} />
          <DetailList title="Flow Details" data={flowDetails} />
          <div className="sm:col-span-2 lg:col-span-1">
            <RadialChart
              title="Campaign Analysis"
              aggregatedData={aggregatedData}
              campaignStats={campaignsStats}
            />
          </div>
        </div>

        <UserDetailsTable users={users} />
      </div>
    </DashboardLayout>
  );
};

export default PromotionsDetailsPage;
