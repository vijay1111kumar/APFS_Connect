import React, { useState, useEffect } from "react";
import Header from "../components/Common/Header";
import Alert from "../components/Common/Alert";
import Insights from "../components/Common/Insights";
import FlowTable from "../components/Flows/FlowTable";
import FlowModal from "../components/Flows/FlowModal";
import DashboardLayout from "../components/Layout/DashboardLayout";
import PerformanceChart from "../components/Flows/PerformanceChart";

import { fetchFlows, createFlow, updateFlow, deleteFlow, toggleFlowStatus, fetchFlowsPerformance } from "../utils/api";

const FlowPage = () => {
  const [alert, setAlert] = useState(null);
  const [flows, setFlows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [totalStats, setTotalStats] = useState({ total: 0, active: 0, inactive: 0, connected: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchFlows();
        setFlows(data);

        if (data.length > 0); 
        setTotalStats({
          total: data.length,
          active: data.filter((flow) => flow.is_active === true).length,
          inactive: data.filter((flow) => flow.is_active !== true).length,
          connected: data.filter((flow) => flow.status === "Completed").length,
        });
      } catch (error) {
        console.error("Error fetching Flows:", error);
      }
    };

    fetchData();
  }, []);


  const handleCreateFlow = async (flowData) => {
    await createFlow(flowData);
    setIsModalOpen(false);
  };

  const handleUpdateFlow = async (flowId, updatedData) => {
    await updateFlow(flowId, updatedData);
    setSelectedFlow(null);
  };

  const handleDeleteFlow = async (flowId) => {
    await deleteFlow(flowId);
  };

  const handleToggleFlowStatus = async (flowId, status) => {
    await toggleFlowStatus(flowId, status);
  };

	const refreshPromotionsTable = async () => {
			try {
			// Fetch the updated promotions list
			const updatedflows = await fetchFlows();
			setFlows(updatedflows);

			// Update the total statistics based on the new promotions data
			setTotalStats({
					total: updatedflows.length,
					active: updatedflows.filter((promo) => promo.is_active === true).length,
					inactive: updatedflows.filter((promo) => promo.is_active !== true).length,
					connected: updatedflows.filter((promo) => promo.status === "Completed").length,
			});

			console.log("Flows table refreshed!");
			} catch (error) {
			console.error("Error refreshing flows table:", error);
			}
	};

  return (
    <DashboardLayout>
        <div className="space-y-6 p-6 rounded-lg border border-gray-200 bg-white">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            <Header
                title="Flows"
                description="Manage your flows here."
                buttonText="Create Flow"
                onButtonClick={() => setIsModalOpen(true)}
            />
            <Insights totalStats={totalStats} />
            <PerformanceChart fetchFlowsPerformance={fetchFlowsPerformance} />
            <FlowTable
                flows={flows}
                onEdit={(flow) => setSelectedFlow(flow)}
                onDelete={handleDeleteFlow}
                onToggleStatus={handleToggleFlowStatus}
            />
            {isModalOpen && (
                <FlowModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreateFlow}
                />
            )}
    </div>
    </DashboardLayout>

  );
};

export default FlowPage;
