import API from './api';

export const reportService = {
  getReports: async () => {
    return await API.get('/reports');
  },

  generateReport: async (title = 'Executive Return Intelligence Report') => {
    return await API.post('/reports/generate', { title });
  },

  getDownloadUrl: (filename) => {
    const base = import.meta.env.VITE_API_URL || '/api';
    return `${base}/reports/download/${filename}`;
  }
};
