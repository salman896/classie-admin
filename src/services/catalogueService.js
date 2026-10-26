import apiClient from './apiClient';

export const catalogueService = {
  // Product List (Admin)
  getAdminProducts: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.product_type) query.append('product_type', params.product_type);
    if (params.is_active !== undefined) query.append('is_active', params.is_active);
    if (params.page) query.append('page', params.page);

    const res = await apiClient.get(`/api/catalogue/admin/products/?${query.toString()}`);
    return res.data;
  },

  // Product Detail (Admin)
  getProductDetail: async (productUid) => {
    const res = await apiClient.get(`/api/catalogue/admin/products/${productUid}/`);
    return res.data;
  },

  // Product Create
  createProduct: async (productData) => {
    const res = await apiClient.post('/api/catalogue/products/', productData);
    return res.data;
  },

  // Product Update
  updateProduct: async (productUid, productData) => {
    const res = await apiClient.patch(`/api/catalogue/products/${productUid}/`, productData);
    return res.data;
  },

  // Product Delete (Soft Delete)
  deleteProduct: async (productUid) => {
    const res = await apiClient.delete(`/api/catalogue/products/${productUid}/`);
    return res.data;
  },

  // Variant Create
  createVariant: async (productUid, variantData) => {
    const res = await apiClient.post(`/api/catalogue/products/${productUid}/variants/`, variantData);
    return res.data;
  },

  // Variant Update
  updateVariant: async (variantUid, variantData) => {
    const res = await apiClient.patch(`/api/catalogue/variants/${variantUid}/`, variantData);
    return res.data;
  },

  // Variant Delete
  deleteVariant: async (variantUid) => {
    const res = await apiClient.delete(`/api/catalogue/variants/${variantUid}/`);
    return res.data;
  },

  // Image Management
  uploadProductImage: async (productUid, formData) => {
    const res = await apiClient.post(`/api/catalogue/products/${productUid}/images/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteProductImage: async (imageUid) => {
    const res = await apiClient.delete(`/api/catalogue/images/${imageUid}/`);
    return res.data;
  },

  // Master Choices (categories, types)
  getChoices: async () => {
    const res = await apiClient.get('/api/catalogue/choices/');
    return res.data;
  },

  // Master Attributes (Size, Color, etc.)
  getAttributes: async () => {
    const res = await apiClient.get('/api/catalogue/attributes/');
    return res.data;
  },
};

