import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { fetchRemainders } from "../utils/api";

const RemaindersPage = () => {
  const [reminders, setReminders] = useState(null);

  useEffect(() => {
    const getRemindersData = async () => {
      try {
        const { data } = await fetchRemainders();
        setReminders(data);
      } catch (error) {
        console.error("Error fetching reminders data:", error);
      }
    };

    getRemindersData();
  }, []);

  if (!reminders) return <div className="text-text">Loading...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ backgroundColor: 'theme("colors.background")' }}>
        <h2 className="text-3xl font-bold text-text">Reminders Analytics</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Reminders Sent */}
          <div
            className="block rounded-lg shadow-lg p-6 border"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">Total Reminders Sent</h3>
            <p className="text-4xl font-bold" style={{ color: 'theme("colors.highlight")' }}>
              {reminders.total_reminders_sent}
            </p>
          </div>

          {/* Reminder Completion Rate */}
          <div
            className="block rounded-lg shadow-lg p-6 border"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">Completion Rate</h3>
            <p className="text-4xl font-bold" style={{ color: 'theme("colors.highlight")' }}>
              {reminders.completion_rate}
            </p>
          </div>

          {/* Retry Analysis */}
          <div
            className="block rounded-lg shadow-lg p-6 border col-span-2"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">Retry Analysis</h3>
            <ul className="mt-4 space-y-2">
              <li className="flex justify-between">
                <span className="font-medium text-text">Successful Retries</span>
                <span className="font-bold text-text">{reminders.retry_analysis.successful_retries}</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium text-text">Failed Retries</span>
                <span className="font-bold text-text">{reminders.retry_analysis.failed_retries}</span>
              </li>
            </ul>
          </div>

          {/* Missed Reminders */}
          <div
            className="block rounded-lg shadow-lg p-6 border"
            style={{
              backgroundColor: 'theme("colors.primary")',
              borderColor: 'theme("colors.highlight")',
            }}
          >
            <h3 className="text-xl font-semibold text-text">Missed Reminders</h3>
            <p className="text-4xl font-bold" style={{ color: 'theme("colors.highlight")' }}>
              {reminders.missed_reminders}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RemaindersPage;
