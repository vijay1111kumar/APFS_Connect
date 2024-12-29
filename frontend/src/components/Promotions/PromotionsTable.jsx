import React from "react";
import { useNavigate } from "react-router-dom";
import Table from "../Common/Table";

const PromotionsTable = ({ promotions }) => {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleViewClick = (id) => {
    navigate(`/promotions/${id}`); // Navigate to the promotion details page
  };

  return (
    <div className="p-4 bg-white rounded border border-gray-200">
      <h3 className="text-lg font-bold mb-4">Promotions List</h3>
      <Table
        data={promotions.map((promo) => ({
          ...promo,
          Actions: (
            <button
              onClick={() => handleViewClick(promo.id)}
              className="inline-block rounded border border-gray-200 bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
            >
              View
            </button>
          ),
        }))}
      />
    </div>
  );
};

export default PromotionsTable;
