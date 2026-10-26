import apiClient from './apiClient';

export const orderService = {
  // Get all orders with optional filter params (order_status, payment_status, search, page)
  getOrders: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.order_status) query.append('order_status', params.order_status);
    if (params.payment_status) query.append('payment_status', params.payment_status);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.page_size) query.append('page_size', params.page_size || 20);

    const res = await apiClient.get(`/api/admin/orders/?${query.toString()}`);
    return res.data;
  },

  // Get single order detail
  getOrderDetail: async (identifier) => {
    const res = await apiClient.get(`/api/admin/orders/${identifier}/`);
    return res.data;
  },

  // Update order status with transition constraints
  updateOrderStatus: async (identifier, { order_status, payment_status, notes }) => {
    const res = await apiClient.patch(`/api/admin/orders/${identifier}/status/`, {
      order_status,
      payment_status,
      notes,
    });
    return res.data;
  },
};
