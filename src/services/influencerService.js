import apiClient from './apiClient';

export const influencerService = {
  // Get list of influencers with metrics and status filter
  getInfluencers: async (params = {}) => {
    const response = await apiClient.get('/api/admin/influencers/', { params });
    return response.data;
  },

  // Approve or Reject an influencer
  updateApproval: async (uid, { action, rejection_reason = '', commission_percentage }) => {
    const payload = { action };
    if (rejection_reason) payload.rejection_reason = rejection_reason;
    if (commission_percentage !== undefined) payload.commission_percentage = commission_percentage;
    const response = await apiClient.patch(`/api/admin/influencers/${uid}/approval/`, payload);
    return response.data;
  },
};
