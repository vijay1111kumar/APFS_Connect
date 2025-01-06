import React from "react";
import { useNavigate } from "react-router-dom";
import Table from "../Common/Table";

const UserDetailsTable = ({ users }) => {
  const navigate = useNavigate(); // 

  const handleViewClick = (id) => {
    navigate(`/users/${id}`); 
  };

  return (
    <div className="p-4 bg-white rounded border border-gray-200">
    <h3 className="text-lg font-bold mb-4">User Details</h3>
      {users.length > 0 ? (
        <Table
          data={users.map((user) => ({
            Name: user.name || "User",
            Phone_no: user.phone_no,
            Flow_Completed: user.flow_completed ? "Yes" : "No",
            Interacted: user.interacted ? "Yes" : "No",
            Message_Sent: user.message_sent ? "Yes" : "No",
            Message_Read: user.message_read ? "Yes" : "No",
            Actions: (
              <button
                onClick={() => handleViewClick(user.phone_no)}
                className="inline-block rounded border border-gray-200 bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-highlight"
              >
                View
              </button>
            ),
          }))}
        />
      ) : (
        <p className="text-sm text-gray-600">No users found for this promotion.</p>
      )}
  </div>
  );
};

export default UserDetailsTable;
