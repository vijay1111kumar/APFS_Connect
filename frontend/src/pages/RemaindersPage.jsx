import React, { useEffect, useState } from "react";
import { fetchRemainders } from "../utils/api";
import DashboardLayout from "../components/Layout/DashboardLayout";
import Header from "../components/Common/Header";
import PerformanceChart from "../components/Common/PerformanceChart";
import Insights from "../components/Remainders/Insights";
import RemaindersTable from "../components/Remainders/RemaindersTable";
import RemaindersModal from "../components/Remainders/RemaindersModal";

const RemaindersPage = () => {
  const [remainders, setRemainders] = useState([]);
  const [totalStats, setTotalStats] = useState({ total: 0, active: 0, scheduled: 0, completed: 0 });
  const [selectedRemainderId, setSelectedRemainderId] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchRemainders();
        setRemainders(data);

        if (data.length > 0) setSelectedRemainderId(data[0].id); 

        setTotalStats({
          total: data.length,
          active: data.filter((remainder) => remainder.status === "Active").length,
          scheduled: data.filter((remainder) => remainder.status === "Scheduled").length,
          completed: data.filter((remainder) => remainder.status === "Completed").length,
        });
      } catch (error) {
        console.error("Error fetching Remainders:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 rounded-lg border border-gray-200 bg-white">
        <Header
          title="Remainders"
          description="Configure your Remainders here..."
          buttonText="Create"
          onButtonClick={() => setIsModalOpen(true)} 
        />
        <Insights totalStats={totalStats} />
        <PerformanceChart
          records={remainders}
          selectedId={selectedRemainderId}
          onChange={setSelectedRemainderId}
        />
        <RemaindersTable remainders={remainders} />
        {isModalOpen && <RemaindersModal onClose={() => setIsModalOpen(false)} />}
      </div>
    </DashboardLayout>
  );
};

export default RemaindersPage;
