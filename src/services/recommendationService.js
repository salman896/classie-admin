import apiClient from './apiClient';

export const recommendationService = {
  getPlans: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.event) query.append('event', params.event);
    if (params.is_active !== undefined) query.append('is_active', params.is_active);

    const res = await apiClient.get(`/api/admin/recommendations/plans/?${query.toString()}`);
    return res.data;
  },

  getPlanDetail: async (planUid) => {
    const res = await apiClient.get(`/api/admin/recommendations/plans/${planUid}/`);
    return res.data;
  },

  createPlan: async (planData) => {
    const res = await apiClient.post('/api/admin/recommendations/plans/', planData);
    return res.data;
  },

  updatePlan: async (planUid, planData) => {
    const res = await apiClient.patch(`/api/admin/recommendations/plans/${planUid}/`, planData);
    return res.data;
  },

  deletePlan: async (planUid) => {
    const res = await apiClient.delete(`/api/admin/recommendations/plans/${planUid}/`);
    return res.data;
  },
};
