import React from "react";
import AreaChart from "../Chart/AreaChart";
import Divider from "../Common/Divider";

const PerformanceChart = ({ records, selectedId, onChange }) => (
  <div className="p-4 bg-white rounded border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold">Performance Chart</h3>
      <select
        className="rounded border-gray-300 px-3 py-2 text-sm"
        value={selectedId || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {records.map((record) => (
          <option key={record.id} value={record.id}>
            {record.name}
          </option>
        ))}
      </select>
    </div>
    <Divider />
    {selectedId && <AreaChart flowId={selectedId} />}
  </div>
);

export default PerformanceChart;
