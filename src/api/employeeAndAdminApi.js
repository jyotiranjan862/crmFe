// Create employee
export const createEmployee = async (data) => {
  const response = await axiosInstance.post('/employees', data);
  return response.data;
};

// Get all employees (with search, pagination, filters, sorting)
export const getEmployees = async (params) => {
  const response = await axiosInstance.get('/employees', { params });
  return response.data;
};

// Get employee by ID
export const getEmployeeById = async (id) => {
  const response = await axiosInstance.get(`/employees/${id}`);
  return response.data;
};

// Update employee by ID
export const updateEmployee = async (id, data) => {
  const response = await axiosInstance.put(`/employees/${id}`, data);
  return response.data;
};

// Soft delete employee by ID
export const deleteEmployee = async (id) => {
  const response = await axiosInstance.delete(`/employees/${id}`);
  return response.data;
};

// Employee login
export const loginEmployee = async (data) => {
  const response = await axiosInstance.post('/employees/login', data);
  return response.data;
};

// Change employee password
export const changeEmployeePassword = async (id, data) => {
  const response = await axiosInstance.post(`/employees/${id}/change-password`, data);
  return response.data;
};

// Admin login
export const loginAdmin = async (data) => {
  const response = await axiosInstance.post('/admin/login', data);
  return response.data;
};

// Create admin
export const createAdmin = async (data) => {
  const response = await axiosInstance.post('/admin', data);
  return response.data;
};

// Get all admins (search, pagination, filters, sorting)
export const getAdmins = async (params) => {
  const response = await axiosInstance.get('/admin', { params });
  return response.data;
};

// Get admin by ID
export const getAdminById = async (id) => {
  const response = await axiosInstance.get(`/admin/${id}`);
  return response.data;
};

// Update admin by ID
export const updateAdmin = async (id, data) => {
  const response = await axiosInstance.patch(`/admin/${id}`, data);
  return response.data;
};

// Soft delete admin by ID
export const deleteAdmin = async (id) => {
  const response = await axiosInstance.delete(`/admin/${id}`);
  return response.data;
};

// Update admin password
export const updateAdminPassword = async (id, data) => {
  const response = await axiosInstance.patch(`/admin/${id}/password`, data);
  return response.data;
};