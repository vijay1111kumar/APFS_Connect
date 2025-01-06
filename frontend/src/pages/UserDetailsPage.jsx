import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../components/Layout/DashboardLayout";
import DetailList from "../components/Common/DetailList";
import Header from "../components/Common/Header";
import { fetchUserDetails } from "../utils/api";
import Chat from "../components/Common/Chat";
import Stepper from "../components/Common/Stepper";
import DonutChart from "../components/Common/DonutChart";

const UserDetailsPage = () => {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await fetchUserDetails(id);
        setUserDetails(details);

        // Dummy data for chart
        const dummyData = [
          { label: "Diwali", stepsCompleted: 3, totalSteps: 10 },
          { label: "Summer Sale", stepsCompleted: 2, totalSteps: 8 },
          { label: "New Year", stepsCompleted: 5, totalSteps: 5 },
          { label: "Onam", stepsCompleted: 4, totalSteps: 6 },
        ];
        setChartData(dummyData);

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

  const stepData = {
    steps: [
      { title: "Step 1", description: "Promotion Sent" },
      { title: "Step 2", description: "Bike Selection" },
      { title: "Step 3", description: "Test Ride" },
      { title: "Step 4", description: "Location Selection" },
      { title: "Step 5", description: "Timeslot Selected" },
      { title: "Step 6", description: "User Confirmation" },
    ],
    completed: false,
    cut_off: 3, // Only the first 3 steps are completed
  };

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
          buttonText="Re-Send"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* User Details */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-center p-6 h-full bg-white rounded-lg border border-gray-200">
              <img
                src={userDetails.profile_picture}
                alt="User Profile"
                className="w-32 h-32 rounded-full mb-4"
              />
              <DetailList title="User Stats" data={userStats} />
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-3 p-6 bg-white border border-gray-200 rounded-lg">
            <div className="col-start-2 max-h-auto" >
            <Stepper
              steps={stepData.steps}
              completed={stepData.completed}
              cutOff={stepData.cut_off}
            />
            </div>
          </div>

          {/* {Donut Chart} */}
          <div className=" bg-white border border-gray-200 rounded-lg">
            <h5 className="text-lg p-4 font-bold text-gray-900 dark:text-white">Promotion Involvement</h5>
            <DonutChart title="Promotion Involvement" data={chartData} />
          </div>

          {/* Conversation */}
          <div className="col-span-2 border border-gray-200 rounded-lg ">
            <h5 className="text-lg px-6 pt-6 font-bold text-gray-900 dark:text-white">User Conversation</h5>
            <Chat user_profile_picture={userDetails.profile_picture} conversation={userDetails.conversation} />
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetailsPage;
