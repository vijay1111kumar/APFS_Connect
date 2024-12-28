import React from "react";
import AreaChart from "../Chart/AreaChart";
import Divider from "../Common/Divider";

const PerformanceChart = ({ promotions, selectedPromotionId, onPromotionChange }) => (
  <div className="p-4 bg-white rounded border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold">Performance Chart</h3>
      <select
        className="rounded border-gray-300 px-3 py-2 text-sm"
        value={selectedPromotionId || ""}
        onChange={(e) => onPromotionChange(e.target.value)}
      >
        {promotions.map((promo) => (
          <option key={promo.id} value={promo.id}>
            {promo.name}
          </option>
        ))}
      </select>
    </div>
    <Divider />
    {selectedPromotionId && <AreaChart flowId={selectedPromotionId} />}
  </div>
);

export default PerformanceChart;
