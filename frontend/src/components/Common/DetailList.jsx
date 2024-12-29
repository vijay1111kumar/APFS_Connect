import React from "react";

const DetailList = ({ title = null, data }) => {
  return (
    <div className="flow-root rounded-lg border border-gray-200 py-3 h-auto">
      {/* Title */}
      {title && <h4 className="text-lg font-bold px-3 mb-3">{title}</h4>}

      {/* Data Display */}
       {data && (
            <dl className="divide-y divide-gray-200 text-sm">
            {Object.entries(data).map(([key, value]) => (
                <div
                key={key}
                className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 px-4 py-2"
                >
                    <dt className="font-medium text-gray-900 capitalize">{key.replace(/_/g, " ")}</dt>
                    <dd className="text-gray-700 col-span-1 md:col-span-2">{value}</dd>
                </div>
            ))}
        </dl>)}
    </div>
  );
};




export default DetailList;
