import React, { useEffect, useState } from "react";
import { fetchPromotionDetails, fetchPromotionUsers } from "../utils/api";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useParams } from "react-router-dom";
import DetailList from "../components/Common/DetailList";
import Header from "../components/Common/Header";
import RadialChart from "../components/Chart/RadialChart";
import UserDetailsTable from "../components/Promotions/UserDetailsTable";

const PromotionsDetailsPage = () => {
  const [promotionDetails, setPromotionDetails] = useState(null);
  const [users, setUsers] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await fetchPromotionDetails(id);
        setPromotionDetails(details);

        const userDetails = await fetchPromotionUsers(id);
        setUsers(userDetails);
      } catch (error) {
        console.error("Error fetching promotion details:", error);
      }
    };

    fetchDetails();
  }, [id]);

  if (!promotionDetails) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-bold">Loading...</h2>
        </div>
      </DashboardLayout>
    );
  }

  const messageAnalysis = {
    sent: promotionDetails?.sent,
    failed: promotionDetails?.failed,
    total: promotionDetails?.sent,
    interacted: promotionDetails?.interacted,
    unread: promotionDetails?.unread,
  }

  const messageDetails = {
    header: promotionDetails?.header,
    message_type: promotionDetails?.message_type,
    body: promotionDetails?.body,
    body_url: promotionDetails?.body_url,
    footer: promotionDetails?.footer,
    flow: promotionDetails?.flow_name,
  };

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
          <DetailList title="Message Details" data={messageDetails} />
          <div className="sm:col-span-2  lg:col-span-1">
            <RadialChart title="Message Analysis" data={messageAnalysis} />
          </div>
        </div>

        <UserDetailsTable users={users} />

      </div>
    </DashboardLayout>
  );
};

export default PromotionsDetailsPage;
