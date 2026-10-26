import apiClient from './apiClient';

export const customerService = {
  getCustomers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.is_active !== undefined && params.is_active !== '') query.append('is_active', params.is_active);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.page_size) query.append('page_size', params.page_size);

    const res = await apiClient.get(`/api/admin/customers/?${query.toString()}`);
    return res.data;
  },

  getCustomerDetail: async (customerUid) => {
    const res = await apiClient.get(`/api/admin/customers/${customerUid}/`);
    return res.data;
  },

  toggleCustomerStatus: async (customerUid, is_active) => {
    const payload = is_active !== undefined ? { is_active } : {};
    const res = await apiClient.post(`/api/admin/customers/${customerUid}/status/`, payload);
    return res.data;
  },
};
