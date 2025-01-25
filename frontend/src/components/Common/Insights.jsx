import React from "react";
import Card from "../Common/Card";

const Insights = ({ totalStats }) => (
  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:mx-2">
    {Object.entries(totalStats).map(([key, value]) => (
      <Card 
        key={key} 
        title={key.charAt(0).toUpperCase() + key.slice(1)} // Capitalize the key for the title
        value={value}   
        current_value={value} 
      />
    ))}
  </div>
);

export default Insights;
