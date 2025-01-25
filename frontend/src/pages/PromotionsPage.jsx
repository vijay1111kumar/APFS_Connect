import React, { useEffect, useState } from "react";
import { fetchPromotions, fetchPromotionsPerformance } from "../utils/api";
import DashboardLayout from "../components/Layout/DashboardLayout";
import Alert from "../components/Common/Alert";
import Header from "../components/Common/Header";
import Insights from "../components/Common/Insights";
import PerformanceChart from "../components/Promotions/PerformanceChart";
import PromotionsTable from "../components/Promotions/PromotionsTable";
import PromotionsModal from "../components/Promotions/PromotionsModal";

const PromotionsPage = () => {
  const [alert, setAlert] = useState(null);
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
          active: data.filter((promo) => promo.is_active === true).length,
          scheduled: data.filter((promo) => promo.is_active !== true).length,
          completed: data.filter((promo) => promo.status === "Completed").length,
        });
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };

    fetchData();
  }, []);

  const refreshPromotionsTable = async () => {
    try {
      // Fetch the updated promotions list
      const updatedPromotions = await fetchPromotions();
      setPromotions(updatedPromotions);
  
      // Update the total statistics based on the new promotions data
      setTotalStats({
        total: updatedPromotions.length,
        active: updatedPromotions.filter((promo) => promo.is_active === true).length,
        scheduled: updatedPromotions.filter((promo) => promo.is_active !== true).length,
        completed: updatedPromotions.filter((promo) => promo.status === "Completed").length,
      });
  
      console.log("Promotions table refreshed!");
    } catch (error) {
      console.error("Error refreshing promotions table:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 m-x-6 p-6 sm:p-4 rounded-md border-2 border-gray-300 bg-white">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <Header
          title="Promotions"
          description="Configure your promotions here..."
          buttonText="Create"
          onButtonClick={() => setIsModalOpen(true)} 
        />
        <Insights totalStats={totalStats} />
        <PerformanceChart fetchPromotionsPerformance={fetchPromotionsPerformance} />
        <PromotionsTable promotions={promotions} />
        {isModalOpen && (
          <PromotionsModal 
          onClose={() => setIsModalOpen(false)} 
          onPromotionCreated={refreshPromotionsTable}
          setGlobalAlert={setAlert}
          />)}
      </div>
    </DashboardLayout>
  );
};

export default PromotionsPage;
