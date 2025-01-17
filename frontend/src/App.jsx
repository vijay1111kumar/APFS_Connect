import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import FlowStatsPage from "./pages/FlowStatsPage";
import TimeBasedPage from "./pages/TimeBasedPage";
import ErrorAnalyticsPage from "./pages/ErrorAnalyticsPage";
import SummaryPage from "./pages/SummaryPage";
import TestPage from "./pages/TestPage";
import UserDetailsPage from "./pages/UserDetailsPage";

import CampaignsPage from "./pages/CampaignsPage";

import PromotionsPage from "./pages/PromotionsPage";
import PromotionsDetailsPage from "./pages/PromotionsDetailsPage";
import PromotionUserDetailsPage from "./pages/PromotionUserDetailsPage";

import RemaindersPage from "./pages/RemaindersPage";
import RemaindersUserDetailsPage from "./pages/RemaindersUserDetailsPage";
import RemaindersDetailsPage from "./pages/RemaindersDetailsPage";

import FlowsPage from "./pages/FlowsPage"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/flows" element={<FlowsPage />} />
        <Route path="/remainders" element={<RemaindersPage />} />
        {/* <Route path="/flow-stats" element={<FlowStatsPage />} /> */}
        {/* <Route path="/time-based" element={<TimeBasedPage />} />; */}
        {/* <Route path="/error-analytics" element={<ErrorAnalyticsPage />} />; */}
        {/* <Route path="/summary" element={<SummaryPage />} />; */}
        {/* <Route path="/test" element={<TestPage />} />; */}
        <Route path="/promotions/:id" element={<PromotionsDetailsPage />} /> 
        <Route path="/promotions/users/:id" element={<PromotionUserDetailsPage />} />
        <Route path="/remainders/:id" element={<RemaindersDetailsPage />} /> 
        <Route path="/remainders/users/:id" element={<RemaindersUserDetailsPage />} />
        <Route path="/users/:id" element={<UserDetailsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
