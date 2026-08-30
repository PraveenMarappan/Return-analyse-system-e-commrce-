import API from './api';

export const aiService = {
  analyzeReturn: async (payload, imageFile = null) => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('customer_comment', payload.customer_comment || '');
      if (payload.product_id) formData.append('product_id', payload.product_id);
      if (payload.return_reason) formData.append('return_reason', payload.return_reason);
      formData.append('damage_image', imageFile);

      return await API.post('/ai/analyze-return', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return await API.post('/ai/analyze-return', payload);
  },

  getDashboardSummary: async (params = {}) => {
    return await API.get('/dashboard/summary', { params });
  },

  getDashboardTrends: async (params = {}) => {
    return await API.get('/dashboard/trends', { params });
  },

  getDashboardReasons: async (params = {}) => {
    return await API.get('/dashboard/reasons', { params });
  },

  getDashboardCategories: async (params = {}) => {
    return await API.get('/dashboard/categories', { params });
  },

  getAIInsights: async () => {
    return await API.get('/ai/insights');
  },

  getRecommendations: async () => {
    return await API.get('/ai/recommendations');
  },

  getRiskProducts: async () => {
    return await API.get('/ai/risk-products');
  },

  calculateSimulation: async (payload) => {
    return await API.post('/simulator/calculate', payload);
  },

  getAlerts: async (params = {}) => {
    return await API.get('/alerts', { params });
  },

  markAlertRead: async (id) => {
    return await API.put(`/alerts/${id}/read`);
  },

  markAlertResolved: async (id) => {
    return await API.put(`/alerts/${id}/resolve`);
  },

  getAdminUsers: async () => {
    return await API.get('/admin/users');
  },

  createAdminUser: async (data) => {
    return await API.post('/admin/users', data);
  },

  updateAdminUser: async (id, data) => {
    return await API.put(`/admin/users/${id}`, data);
  },

  deleteAdminUser: async (id) => {
    return await API.delete(`/admin/users/${id}`);
  }
};
