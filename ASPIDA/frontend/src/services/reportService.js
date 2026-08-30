import API from './api';

export const reportService = {
  getReports: async () => {
    return await API.get('/reports');
  },

  generateReport: async (title = 'Executive Return Intelligence Report') => {
    return await API.post('/reports/generate', { title });
  },

  getDownloadUrl: (filename) => {
    return `/api/reports/download/${filename}`;
  }
};
