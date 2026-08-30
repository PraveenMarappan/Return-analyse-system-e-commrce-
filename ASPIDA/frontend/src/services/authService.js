import API from './api';

export const authService = {
  login: async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const res = await API.post('/auth/login', { email: cleanEmail, password });
    
    const token = res.token || res.data?.token;
    const user = res.user || res.data?.user;

    if (token && user) {
      localStorage.setItem('aspida_token', token);
      localStorage.setItem('aspida_user', JSON.stringify(user));
    }
    return { ...res, token, user };
  },

  logout: () => {
    localStorage.removeItem('aspida_token');
    localStorage.removeItem('aspida_user');
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('aspida_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  fetchMe: async () => {
    const res = await API.get('/auth/me');
    const user = res.user || res.data;
    if (user) {
      localStorage.setItem('aspida_user', JSON.stringify(user));
    }
    return res;
  }
};

