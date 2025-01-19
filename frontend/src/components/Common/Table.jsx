import React from "react";

const Table = ({ title, data = [] }) => {
  // Extract headers from the keys of the first object in the data array
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="overflow-x-auto">
    {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}

      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead className="text-left">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 capitalize"
              >
                {header.replace(/_/g, " ")}
              </th>
            ))}
            <th className="px-4 py-2 text-right"></th> {/* Header for the "View" button */}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header) => (
                <td
                  key={header}
                  className="whitespace-nowrap px-4 py-2 text-gray-700 text-left"
                >
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
