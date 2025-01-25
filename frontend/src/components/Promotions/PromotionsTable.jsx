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
    <div>
      <div className="grid-cols-2 lg:col-col-span-2 md:col-span-1 sm:col-span-1 lg:p-4 p-2 m-2 bg-white rounded-md border-2 border-gray-300">
        <h3 className="text-xl text-primary font-bold mb-4">Promotions List</h3>
        <Table data={formattedPromotions} />
      </div>
    </div>
  );
};

export default PromotionsTable;
