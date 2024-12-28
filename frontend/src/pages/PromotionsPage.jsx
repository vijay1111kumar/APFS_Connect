import React, { useEffect, useState } from "react";
import { fetchPromotions } from "../utils/api";
import DashboardLayout from "../components/Layout/DashboardLayout";
import Header from "../components/Common/Header";
import Insights from "../components/Common/Insights";
import PerformanceChart from "../components/Common/PerformanceChart";
import PromotionsTable from "../components/Promotions/PromotionsTable";
import PromotionsModal from "../components/Promotions/PromotionsModal";

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [totalStats, setTotalStats] = useState({ total: 0, active: 0, scheduled: 0, completed: 0 });
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchPromotions();
        setPromotions(data);

        if (data.length > 0) setSelectedPromotionId(data[0].id); 

        setTotalStats({
          total: data.length,
          active: data.filter((promo) => promo.status === "Active").length,
          scheduled: data.filter((promo) => promo.status === "Scheduled").length,
          completed: data.filter((promo) => promo.status === "Completed").length,
        });
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 rounded-lg border border-gray-200 bg-white">
        <Header
          title="Promotions"
          description="Configure your promotions here..."
          buttonText="Create"
          onButtonClick={() => setIsModalOpen(true)} 
        />
        <Insights totalStats={totalStats} />
        <PerformanceChart
          promotions={promotions}
          selectedPromotionId={selectedPromotionId}
          onPromotionChange={setSelectedPromotionId}
        />
        <PromotionsTable promotions={promotions} />
        {isModalOpen && <PromotionsModal onClose={() => setIsModalOpen(false)} />}
      </div>
    </DashboardLayout>
  );
};

export default PromotionsPage;
