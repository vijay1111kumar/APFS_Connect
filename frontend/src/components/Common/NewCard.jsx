import React from "react";

const NewCard = ({ title, value, trend }) => {
  const trendClasses =
    trend > 0
      ? "bg-green-100 text-green-600"
      : trend < 0
      ? "bg-red-100 text-red-600"
      : "bg-gray-100 text-gray-500";

  return (
    <div className="flex gap-4 rounded-lg border border-gray-100 bg-white p-6">
      <div className={`inline-flex items-center gap-2 rounded p-1 ${trendClasses}`}>
        <span>{trend > 0 ? "+" : ""}{trend}%</span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default NewCard;
