import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://apfs.loan2wheels.com/apfsconnect/api', 
});

export const fetchOverview = () => apiClient.get('/overview');
export const fetchUserStats = () => apiClient.get('/user-stats');
export const fetchFlowStats = () => apiClient.get('/flow-stats');
export const fetchFlowDetail = (id) => apiClient.get(`/flows/${id}`);
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

export const fetchFlows = async () => {
  try {
    const { data } = await apiClient.get('/flows');
    return data.data;
  } catch (error) {
    console.error("Error fetching flows:", error);
    throw error;
  }
};

export const createPromotion = async (requestBody) => {
  try {
    const { data } = await apiClient.post('/promotions', requestBody);
    return data.data;
  } catch (error) {
    console.error("Error creating promotions:", error);
    throw error;
  }
};


export const fetchPromotions = async () => {
  try {
    const { data } = await apiClient.get('/promotions');
    return data.data;
  } catch (error) {
    console.error("Error fetching promotions:", error);
    throw error;
  }
};

export const fetchPromotionDetails = async (id) => {
  try {
    const { data } = await apiClient.get(`/promotions/${id}`);
    return data.data;
  } catch (error) {
    console.error("Failed to fetch promotion details");
    throw error;
  }
};

export const fetchCampaignsForPromotion = async (id) => {
  try {
    const { data } = await apiClient.get(`promotions/${id}/campaigns`)
    return data.data;
  } catch (error) {
    console.error("Failed to fetch campaigns for promotion");
    throw error;
  }
};

export const fetchCampaignMetrics = async (campaignId) => {
  try {
    const { data } = await apiClient.get(`/campaigns/${campaignId}/metrics`);
    return data.data;
  } catch (error) {
      console.error("Failed to fetch campaigns for promotion");
      throw error;
  }
};

export const fetchPromotionsPerformance = async () => {
  try {
    const { data } = await apiClient.get('/promotions?performance');
    console.log(data.data.Promotion)
    return data.data.Promotion;
} catch (error) {
    console.error("Failed to fetch campaigns for promotion");
    throw error;
}
};


// --------------------------------------------

export const createCampaigns = async (requestBody) => {
  try {
    const { data } = await apiClient.post('/campaigns', requestBody);
    return data
  } catch (error) {
    console.error("Error creating campaigns:", error);
    throw error;
  }
};


export const fetchCampaigns = async () => {
  try {
    const { data } = await apiClient.get('/campaigns');
    return data.data;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};


export const fetchCampaignsPerformance = async () => {
  try {
    const { data } = await apiClient.get('/campaigns?performance');
    return data.data.Campaign;
} catch (error) {
    console.error("Failed to fetch campaigns for Campaign");
    throw error;
}
};



export const fetchPromotionUsers = async (id) => {
  try {
    const { data } = await apiClient.get(`/promotions/${id}/users`);
    return data;
  } catch (error) {
    console.error("Failed to fetch promotion users");
    throw error;
  }
};


export const fetchRemainders = async () => {
  try {
    const { data } = await apiClient.get('/remainders');
    return data.data;
  } catch (error) {
    console.error("Error fetching remainders:", error);
    throw error;
  }
};

export const fetchRemaindersDetails = async (id) => {
  try {
    const { data } = await apiClient.get(`/remainders/${id}`);
    return data;
  } catch (error) {
    console.error("Failed to fetch remainders details");
    throw error;
  }
};

export const fetchRemaindersUsers = async (id) => {
  try {
    const { data } = await apiClient.get(`/remainders/${id}/users`);
    return data;
  } catch (error) {
    console.error("Failed to fetch remainders users");
    throw error;
  }
};


export const fetchUserDetails = async (id) => {
  try {
    const { data } = await apiClient.get(`/users/${id}`);
    return data;
  } catch (error) {
    console.error("Failed to fetch users details");
    throw error;
  }
};


// Upload Function
// -----------------------------------------------

export const uploadFile = async (file) => {
  try {

    console.log("Uploadingn ", file.type)

    // Prepare the file for upload
    const { data } = await apiClient.post("/upload", file, {
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "X-File-Name": file.name
      },
    });

    return data.data; // Return the response data
  } catch (error) {
    console.error("File upload failed:", error);
    throw error;
  }
};
