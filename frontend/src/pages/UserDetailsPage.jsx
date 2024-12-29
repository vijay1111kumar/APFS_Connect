import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../components/Layout/DashboardLayout";
import DetailList from "../components/Common/DetailList";
import Header from "../components/Common/Header";
import { fetchUserDetails } from "../utils/api";
import Chat from "../components/Common/Chat";

const UserDetailsPage = () => {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await fetchUserDetails(id);
        setUserDetails(details);

      } catch (error) {
        console.error("Error fetching promotion details:", error);
      }
    };

    fetchDetails();

  }, [id]);

  if (!userDetails) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-bold">Loading...</h2>
        </div>
      </DashboardLayout>
    );
  }

  const userStats = {
    "Last Message": userDetails.user_last_message,
    "Completed Flow": userDetails.user_completed_flow ? "Yes" : "No",
    "Cutoff Step": userDetails.user_cutoff_step || "N/A",
    "Time to Complete Flow": userDetails.total_time_took_for_flow_completion || "N/A",
    "Average Message Delays": userDetails.user_average_message_delays || "N/A",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 rounded-lg border border-gray-200 bg-white">
        {/* Header */}
        <Header
          title={`User Details - ${id}`}
          description="Review user-specific details and conversation history."
        />

        {/* User Details and Conversation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Details */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow">
              <img
                src={userDetails.profile_picture}
                alt="User Profile"
                className="w-32 h-32 rounded-full mb-4"
              />
              <DetailList title="User Stats" data={userStats} />
            </div>
          </div>

          {/* Conversation */}
          <Chat  conversation={userDetails.conversation} />

        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetailsPage;
