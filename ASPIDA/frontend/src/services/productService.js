import API from './api';

export const productService = {
  getProducts: async (params = {}) => {
    return await API.get('/products', { params });
  },

  getProductById: async (id) => {
    return await API.get(`/products/${id}`);
  },

  createProduct: async (data) => {
    return await API.post('/products', data);
  },

  updateProduct: async (id, data) => {
    return await API.put(`/products/${id}`, data);
  },

  deleteProduct: async (id) => {
    return await API.delete(`/products/${id}`);
  }
};
