import React from "react";
import { useNavigate } from "react-router-dom";
import Table from "../Common/Table";

const Remainders = ({ remainders }) => {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleViewClick = (id) => {
    navigate(`/remainders/${id}`); // Navigate to the promotion details page
  };

  return (
    <div className="grid-cols-2 lg:col-col-span-2 md:col-span-1 sm:col-span-1 p-4 bg-white rounded border-2 border-gray-200">
      <h3 className="text-lg font-bold mb-4">Remainders List</h3>
      <Table
        data={remainders.map((remainder) => ({
          ...remainder,
          Actions: (
            <button
              onClick={() => handleViewClick(remainder.id)}
              className="inline-block rounded border border-gray-200 bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-highlight"
            >
              View
            </button>
          ),
        }))}
      />
    </div>
  );
};

export default Remainders;
