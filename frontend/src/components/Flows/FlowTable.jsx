import React from "react";
import { useNavigate } from "react-router-dom";
import Table from "../Common/Table";

const FlowTable = ({ flows, onEdit, onDelete, onToggleStatus }) => {

    const navigate = useNavigate();

    // Define the keys to display
    const keysToShow = ["id", "name", "trigger", "flow_file", "is_active", "created_by", "Actions"];
  
    // Format the data to include only the keys we want
    const formattedFlows = flows.map((flow) => {
        const filteredFlow = keysToShow.reduce((acc, key) => {
        if (key in flow) {
            acc[key] = flow[key];
        }
        return acc;
        }, {});

        // Add the Actions column
        filteredFlow.Actions = (
        <button
            onClick={() => navigate(`/flows/${flow.id}`)}
            className="inline-block rounded border border-gray-200 bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-highlight"
        >
            View
        </button>
        );

        return filteredFlow;
    });

    return (
        <div className="p-4 bg-white rounded border border-gray-200">
          <h3 className="text-lg font-bold mb-4">Flows List</h3>
          <Table data={formattedFlows} />
        </div>
      );
};

export default FlowTable;
