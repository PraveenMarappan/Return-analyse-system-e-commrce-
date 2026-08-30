import API from './api';

export const returnService = {
  getReturns: async (params = {}) => {
    return await API.get('/returns', { params });
  },

  getReturnById: async (id) => {
    return await API.get(`/returns/${id}`);
  },

  createReturn: async (data) => {
    return await API.post('/returns', data);
  },

  deleteReturn: async (id) => {
    return await API.delete(`/returns/${id}`);
  }
};
