import React from "react";
import Table from "../Common/Table";

const PromotionsTable = ({ promotions }) => (
  <div className="p-4 bg-white rounded border border-gray-200">
    <h3 className="text-lg font-bold mb-4">Promotions List</h3>
    <Table data={promotions} />
  </div>
);

export default PromotionsTable;