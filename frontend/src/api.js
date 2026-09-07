import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

export const getDeals = () => api.get('deals/');
export const getStages = () => api.get('stages/');
export const changeDealStage = (dealId, stageId) => 
  api.patch(`deals/${dealId}/change_stage/`, { stage_id: stageId });

export default api;