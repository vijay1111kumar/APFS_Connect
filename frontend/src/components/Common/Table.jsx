import React, { useState, useEffect } from "react";

const Table = ({ title, data = [] }) => {
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    // Extract headers from the keys of the first object in the data array
    const extractedHeaders = data.length > 0 ? Object.keys(data[0]) : [];
    setHeaders(extractedHeaders);
    setVisibleColumns(extractedHeaders); // Initially, show all columns
  }, [data]);

  useEffect(() => {
    const updateVisibleColumns = () => {
      const availableWidth = window.innerWidth;
      let columnsToShow = [...headers];

      if (columnsToShow.length > 1) {
        const actionColumn = columnsToShow.pop(); // Keep the last column fixed

        // Adjust the number of columns to display based on screen size
        if (availableWidth < 640) {
          // Small screens (e.g., mobile): Show only 1 data column + last column
          columnsToShow = columnsToShow.slice(0, 1);
        } else if (availableWidth < 1024) {
          // Medium screens (e.g., tablets): Show up to 3 data columns + last column
          columnsToShow = columnsToShow.slice(0, 3);
        }

        columnsToShow.push(actionColumn); // Add the last column back
      }

      setVisibleColumns(columnsToShow);
    };

    updateVisibleColumns();
    window.addEventListener("resize", updateVisibleColumns);

    return () => {
      window.removeEventListener("resize", updateVisibleColumns);
    };
  }, [headers]);

  return (
    <div className="grid-cols-2 lg:col-span-2 md:col-span-1 sm:col-span-1">
      {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}

      <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
        <thead className="text-left">
          <tr>
            {visibleColumns.map((header) => (
              <th
                key={header}
                className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 capitalize"
              >
                {header.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {visibleColumns.map((header) => (
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
