import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import UserDetailsPage from "./pages/UserDetailsPage";
import FlowStatsPage from "./pages/FlowStatsPage";
import PromotionsPage from "./pages/PromotionsPage";
import RemaindersPage from "./pages/RemaindersPage";
import TimeBasedPage from "./pages/TimeBasedPage";
import ErrorAnalyticsPage from "./pages/ErrorAnalyticsPage";
import SummaryPage from "./pages/SummaryPage";
import TestPage from "./pages/TestPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/remainders" element={<RemaindersPage />} />
        <Route path="/user-stats" element={<UserDetailsPage />} />
        <Route path="/flow-stats" element={<FlowStatsPage />} />
        <Route path="/time-based" element={<TimeBasedPage />} />;
        <Route path="/error-analytics" element={<ErrorAnalyticsPage />} />;
        <Route path="/summary" element={<SummaryPage />} />;
        <Route path="/test" element={<TestPage />} />;
      </Routes>
    </Router>
  );
};

export default App;
