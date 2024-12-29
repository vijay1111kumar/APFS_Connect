import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://app.loan2wheels.com/apfsconnect/api/analytics', 
});

export const fetchOverview = () => apiClient.get('/overview');
export const fetchUserStats = () => apiClient.get('/user-stats');
export const fetchFlowStats = () => apiClient.get('/flow-stats');
export const fetchFlowDetail = (id) => apiClient.get(`/flows/${id}`);
export const fetchRemainders = () => apiClient.get('/remainders');
export const fetchTimeBased = () => apiClient.get('/time-based');
export const fetchErrorFailures = () => apiClient.get('/error-failures');
export const fetchSummary = () => apiClient.get('/summary');
export const fetchTest = () => apiClient.get('/test');


export const fetchDashboardMetrics = async (category) => {
  try {
    const { data } = await apiClient.get(`/overview?category=${category.toLowerCase()}`);
    return data;
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    throw error;
  }
};

export const fetchPromotions = async () => {
  try {
    const { data } = await apiClient.get('/promotions');
    return data;
  } catch (error) {
    console.error("Error fetching promotions:", error);
    throw error;
  }
};