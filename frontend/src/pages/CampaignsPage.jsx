import React, { useEffect, useState } from "react";
import { fetchCampaigns, fetchCampaignsPerformance } from "../utils/api";
import DashboardLayout from "../components/Layout/DashboardLayout";
import Alert from "../components/Common/Alert";
import Header from "../components/Common/Header";
import Insights from "../components/Common/Insights";
import PerformanceChart from "../components/Campaigns/PerformanceChart";
import CampaignsTable from "../components/Campaigns/CampaignsTable";
import CampaignsModal from "../components/Campaigns/CampaignsModal";
import AreaChart from "../components/Campaigns/AreaChart";

const CampaignsPage = () => {
  const [alert, setAlert] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    completed: 0,
  });
  const [selectedCampaigns, setSelectedCampaigns] = useState([]); // Array of selected campaigns
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchCampaigns();
        setCampaigns(data);

        // Set default selected campaigns (first 3 campaigns)
        const defaultSelection = data.slice(0, 3).map((campaign) => campaign.id);
        setSelectedCampaigns(defaultSelection);

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
      const updatedCampaigns = await fetchCampaigns();
      setCampaigns(updatedCampaigns);

      setTotalStats({
        total: updatedCampaigns.length,
        active: updatedCampaigns.filter((campaign) => campaign.is_active === true).length,
        scheduled: updatedCampaigns.filter((campaign) => campaign.is_active !== true).length,
        completed: updatedCampaigns.filter((campaign) => campaign.status === "Completed").length,
      });
    } catch (error) {
      console.error("Error refreshing campaigns table:", error);
    }
  };

  const handleCampaignSelection = (selectedIds) => {
    setSelectedCampaigns(selectedIds);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 m-x-6 p-6 sm:p-4 rounded-lg border-2 border-gray-300 bg-white">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Header Section */}
        <Header
          title="Campaigns"
          description="Configure your campaigns here..."
          buttonText="Create"
          onButtonClick={() => setIsModalOpen(true)}
        />

        {/* Insights Section */}
        <Insights totalStats={totalStats} />

        {/* Performance Chart Section */}
        <PerformanceChart fetchCampaignsPerformance={fetchCampaignsPerformance} />

        {/* Area Chart Section */}
        {/* <AreaChart campaignIds={selectedCampaigns} /> */}

        {/* Campaigns Table */}
        <CampaignsTable
          campaigns={campaigns}
          onSelectionChange={handleCampaignSelection} // Pass selection handler
        />

        {/* Campaign Modal */}
        {isModalOpen && (
          <CampaignsModal
            onClose={() => setIsModalOpen(false)}
            onCampaignCreated={refreshCampaignsTable}
            setGlobalAlert={setAlert}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CampaignsPage;
