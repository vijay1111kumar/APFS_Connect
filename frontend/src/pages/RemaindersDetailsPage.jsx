import React, { useEffect, useState } from "react";
import { fetchRemaindersDetails, fetchRemaindersUsers } from "../utils/api";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useParams } from "react-router-dom";
import DetailList from "../components/Common/DetailList";
import Header from "../components/Common/Header";
import RadialChart from "../components/Chart/RadialChart";
import UserDetailsTable from "../components/Remainders/UserDetailsTable";

const RemaindersDetailsPage = () => {
  const [remaindersDetails, setRemaindersDetails] = useState(null);
  const [users, setUsers] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const details = await fetchRemaindersDetails(id);
        setRemaindersDetails(details);

        const userDetails = await fetchRemaindersUsers(id);
        setUsers(userDetails);
      } catch (error) {
        console.error("Error fetching remainders details:", error);
      }
    };

    fetchDetails();
  }, [id]);

  if (!remaindersDetails) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-bold">Loading...</h2>
        </div>
      </DashboardLayout>
    );
  }

  const messageAnalysis = {
    sent: remaindersDetails?.sent,
    failed: remaindersDetails?.failed,
    total: remaindersDetails?.sent,
    interacted: remaindersDetails?.interacted,
    unread: remaindersDetails?.unread,
  }

  const messageDetails = {
    header: remaindersDetails?.header,
    message_type: remaindersDetails?.message_type,
    body: remaindersDetails?.body,
    body_url: remaindersDetails?.body_url,
    footer: remaindersDetails?.footer,
    flow: remaindersDetails?.flow_name,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 rounded-lg border border-gray-200 bg-white">
        <Header 
        title={remaindersDetails.name}
        description={remaindersDetails.description || "No description available."}
        buttonText="Re-Send"
        />
        <div className="grid lg:grid-cols-3 md:grid-cols-2 md:col-span-full sm:grid-cols-1 gap-6">
          <DetailList title="Remainders Details" data={remaindersDetails} />
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

export default RemaindersDetailsPage;
