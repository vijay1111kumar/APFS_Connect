import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import AreaChart from "../components/Chart/AreaChart";
import { fetchTest } from "../utils/api";

const TestPage = () => {
  const [testData, setTestData] = useState(null);

  useEffect(() => {
    const getTestData = async () => {
      try {
        const { data } = await fetchTest();
        setTestData(data);
      } catch (error) {
        console.error("Error fetching test data:", error);
      }
    };

    getTestData();
  }, []);

  if (!testData) return <div>Loading...</div>;

  return (
    <DashboardLayout>
    
      <div className="space-y-6 p-6 bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-800">Promotions</h2>
        <AreaChart
          title="32.4k"
          subtitle="Users this week"
          data={[6500, 6418, 6456, 6526, 6356, 6456]}
          categories={[
            "01 February",
            "02 February",
            "03 February",
            "04 February",
            "05 February",
            "06 February",
            "07 February",
          ]}
          growthRate={12}
        />
      </div>
    </DashboardLayout>
  );
};

export default TestPage;
