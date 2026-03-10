// Create campaign
export const createCampaign = async (data) => {
  const response = await axiosInstance.post('/campigne', data);
  return response.data;
};

// Get campaigns by company (with search, pagination, filter)
export const getCampaignsByCompany = async (companyId, params) => {
  const response = await axiosInstance.get(`/campigne/company/${companyId}`, { params });
  return response.data;
};

// Get campaign by ID
export const getCampaignById = async (id) => {
  const response = await axiosInstance.get(`/campigne/${id}`);
  return response.data;
};

// Update campaign by ID
export const updateCampaign = async (id, data) => {
  const response = await axiosInstance.patch(`/campigne/${id}`, data);
  return response.data;
};

// Soft delete campaign by ID
export const deleteCampaign = async (id) => {
  const response = await axiosInstance.delete(`/campigne/${id}`);
  return response.data;
};


// Create lead
export const createLead = async (data) => {
  const response = await axiosInstance.post('/leads', data);
  return response.data;
};

// Get all leads (search, pagination, filter)
export const getLeads = async (params) => {
  const response = await axiosInstance.get('/leads', { params });
  return response.data;
};

// Get lead by ID
export const getLeadById = async (id) => {
  const response = await axiosInstance.get(`/leads/${id}`);
  return response.data;
};

// Update lead by ID
export const updateLead = async (id, data) => {
  const response = await axiosInstance.patch(`/leads/${id}`, data);
  return response.data;
};

// Soft delete lead by ID
export const deleteLead = async (id) => {
  const response = await axiosInstance.delete(`/leads/${id}`);
  return response.data;
};