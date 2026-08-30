const DEMO_USERS = {
  'admin@aspida.com': { id: 1, name: 'ASPIDA Admin', email: 'admin@aspida.com', role: 'admin', is_active: true },
  'manager@aspida.com': { id: 2, name: 'Returns Manager', email: 'manager@aspida.com', role: 'manager', is_active: true },
  'analyst@aspida.com': { id: 3, name: 'Data Analyst', email: 'analyst@aspida.com', role: 'analyst', is_active: true }
};

export const authService = {
  login: (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, message: 'Please enter your email address.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const user = DEMO_USERS[cleanEmail];
    if (!user) {
      return { success: false, message: 'This demo account is not registered. Please use a demo email.' };
    }

    const demoToken = `demo_token_${user.role}_${Date.now()}`;
    localStorage.setItem('aspida_token', demoToken);
    localStorage.setItem('aspida_user', JSON.stringify(user));

    return { success: true, token: demoToken, user, role: user.role };
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

  fetchMe: () => {
    const user = authService.getCurrentUser();
    if (user) {
      return { success: true, user };
    }
    return { success: false, message: 'Not authenticated' };
  }
};
