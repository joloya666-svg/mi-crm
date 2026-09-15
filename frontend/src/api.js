import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crm_access_token');
      localStorage.removeItem('crm_refresh_token');
    }
    return Promise.reject(error);
  }
);

export const login = (username, password) =>
  axios.post('http://localhost:8000/api/token/', { username, password });

export const getDeals = (params) => api.get('deals/', { params });
export const createDeal = (payload) => api.post('deals/', payload);
export const updateDeal = (id, payload) => api.patch(`deals/${id}/`, payload);
export const getStages = () => api.get('stages/');
export const changeDealStage = (dealId, stageId) =>
  api.patch(`deals/${dealId}/change_stage/`, { stage_id: stageId });

export const getProspects = (params) => api.get('prospects/', { params });
export const createProspect = (payload) => api.post('prospects/', payload);
export const updateProspect = (id, payload) => api.patch(`prospects/${id}/`, payload);

export const getOrganizations = () => api.get('organizations/');
export const createOrganization = (payload) => api.post('organizations/', payload);
export const updateOrganization = (id, payload) => api.patch(`organizations/${id}/`, payload);

export const getPeople = () => api.get('people/');
export const createPerson = (payload) => api.post('people/', payload);
export const updatePerson = (id, payload) => api.patch(`people/${id}/`, payload);

export const getProducts = () => api.get('products/');
export const createProduct = (payload) => api.post('products/', payload);
export const updateProduct = (id, payload) => api.patch(`products/${id}/`, payload);

export const getActivities = (params) => api.get('activities/', { params });
export const createActivity = (payload) => api.post('activities/', payload);
export const updateActivity = (id, payload) => api.patch(`activities/${id}/`, payload);

export const getUsers = () => api.get('users/');
export const getDashboard = (params) => api.get('dashboard/', { params });

export default api;
