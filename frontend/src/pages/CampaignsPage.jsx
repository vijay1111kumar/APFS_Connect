import React, { useEffect, useState } from "react";
import { fetchCampaigns, fetchCampaignsPerformance } from "../utils/api";
import DashboardLayout from "../components/Layout/DashboardLayout";
import Alert from "../components/Common/Alert";
import Header from "../components/Common/Header";
import Insights from "../components/Common/Insights";
import PerformanceChart from "../components/Campaigns/PerformanceChart";
import CampaignsTable from "../components/Campaigns/CampaignsTable";
import CampaignsModal from "../components/Campaigns/CampaignsModal";

const CampaignsPage = () => {
  const [alert, setAlert] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [totalStats, setTotalStats] = useState({ total: 0, active: 0, scheduled: 0, completed: 0 });
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCampaigns();
        setCampaigns(data);

        if (data.length > 0) setSelectedCampaignId(data[0].id); 
        setTotalStats({
          total: data.length,
          active: data.filter((campaign) => campaign.is_active === true).length,
          scheduled: data.filter((campaign) => campaign.is_active !== true).length,
          completed: data.filter((campaign) => campaign.status === "Completed").length,
        });
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    fetchData();
  }, []);

  const refreshCampaignsTable = async () => {
    try {
      // Fetch the updated campaigns list
      const updatedCampaigns = await fetchCampaigns();
      setCampaigns(updatedCampaigns);
  
      // Update the total statistics based on the new campaigns data
      setTotalStats({
        total: updatedCampaigns.length,
        active: updatedCampaigns.filter((campaign) => campaign.is_active === true).length,
        scheduled: updatedCampaigns.filter((campaign) => campaign.is_active !== true).length,
        completed: updatedCampaigns.filter((campaign) => campaign.status === "Completed").length,
      });
  
      console.log("Campaigns table refreshed!");
    } catch (error) {
      console.error("Error refreshing campaigns table:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 rounded-lg border border-gray-200 bg-white">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <Header
          title="Campaigns"
          description="Configure your campaigns here..."
          buttonText="Create"
          onButtonClick={() => setIsModalOpen(true)} 
        />
        <Insights totalStats={totalStats} />
        {/* <PerformanceChart
          records={campaigns}
          selectedId={selectedCampaignId}
          onChange={setSelectedCampaignId}
        /> */}
        <PerformanceChart fetchCampaignsPerformance={fetchCampaignsPerformance} />
        <CampaignsTable campaigns={campaigns} />
        {isModalOpen && (
          <CampaignsModal 
          onClose={() => setIsModalOpen(false)} 
          onCampaignCreated={refreshCampaignsTable}
          setGlobalAlert={setAlert}
          />)}
      </div>
    </DashboardLayout>
  );
};

export default CampaignsPage;
