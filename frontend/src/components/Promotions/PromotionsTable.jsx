import React from "react";
import { useNavigate } from "react-router-dom";
import Table from "../Common/Table";

const PromotionsTable = ({ promotions }) => {
  const navigate = useNavigate();

  // Define the keys to display
  const keysToShow = ["id", "name", "description", "connected_flow", "created_by", "promotion_type", "Actions"];

  // Format the data to include only the keys we want
  const formattedPromotions = promotions.map((promo) => {
    const filteredPromo = keysToShow.reduce((acc, key) => {
      if (key in promo) {
        acc[key] = promo[key];
      }
      return acc;
    }, {});

    // Add the Actions column
    filteredPromo.Actions = (
      <button
        onClick={() => navigate(`/promotions/${promo.id}`)}
        className="inline-block rounded border border-gray-200 bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-highlight"
      >
        View
      </button>
    );

    return filteredPromo;
  });

  return (
    <div className="p-4 bg-white rounded border border-gray-200">
      <h3 className="text-lg font-bold mb-4">Promotions List</h3>
      <Table data={formattedPromotions} />
    </div>
  );
};

export default PromotionsTable;
