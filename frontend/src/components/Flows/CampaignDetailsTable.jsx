import React from "react";

const CampaignDetailsTable = ({ campaigns }) => (
  <div className="p-4 bg-white rounded-lg border border-gray-200">
    <h3 className="text-lg font-bold mb-4">Linked Campaigns</h3>
    <table className="min-w-full bg-white border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border border-gray-300 px-4 py-2 text-left">Campaign Name</th>
          <th className="border border-gray-300 px-4 py-2 text-left">Users Targeted</th>
          <th className="border border-gray-300 px-4 py-2 text-left">Messages Delivered</th>
          <th className="border border-gray-300 px-4 py-2 text-left">Flow Completed</th>
          <th className="border border-gray-300 px-4 py-2 text-left">Failed Messages</th>
        </tr>
      </thead>
      <tbody>
        {campaigns.map((campaign, index) => (
          <tr key={index} className="hover:bg-gray-100">
            <td className="border border-gray-300 px-4 py-2">{campaign.name}</td>
            <td className="border border-gray-300 px-4 py-2">{campaign.stats.total_users_targeted}</td>
            <td className="border border-gray-300 px-4 py-2">{campaign.stats.messages_delivered}</td>
            <td className="border border-gray-300 px-4 py-2">{campaign.stats.flow_completed}</td>
            <td className="border border-gray-300 px-4 py-2">{campaign.stats.messages_failed}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CampaignDetailsTable;
