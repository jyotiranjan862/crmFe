// PACKAGES

import axiosInstance from "../utils/axiosInstance";

// Get all packages (with optional pagination/search)
export const fetchPackages = async (params = {}) => {
  const response = await axiosInstance.get('/packages', { params });
  return response.data;
};

// Get a single package by ID
export const fetchPackageById = async (id) => {
  const response = await axiosInstance.get(`/packages/${id}`);
  return response.data;
};

// Create a new package
export const createPackage = async (data) => {
  const response = await axiosInstance.post('/packages', data);
  return response.data;
};

// Update a package by ID
export const updatePackage = async (id, data) => {
  const response = await axiosInstance.put(`/packages/${id}`, data);
  return response.data;
};

// Soft delete a package by ID
export const deletePackage = async (id) => {
  const response = await axiosInstance.delete(`/packages/${id}`);
  return response.data;
};

// COMPANIES

// Get all companies (with optional pagination/search)
export const fetchCompanies = async (params = {}) => {
  const response = await axiosInstance.get('/companies', { params });
  return response.data;
};

// Get a single company by ID
export const fetchCompanyById = async (id) => {
  const response = await axiosInstance.get(`/companies/${id}`);
  return response.data;
};

// Create a new company
export const createCompany = async (data) => {
  const response = await axiosInstance.post('/companies', data);
  return response.data;
};

// Update a company by ID
export const updateCompany = async (id, data) => {
  const response = await axiosInstance.put(`/companies/${id}`, data);
  return response.data;
};

// Soft delete a company by ID
export const deleteCompany = async (id) => {
  const response = await axiosInstance.delete(`/companies/${id}`);
  return response.data;
};