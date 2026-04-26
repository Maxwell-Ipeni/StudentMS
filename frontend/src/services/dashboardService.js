import api from './api';

const dashboardService = {
  /**
   * Get dashboard statistics
   * @returns {Promise}
   */
  getStats: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  /**
   * Get quick stats for cards
   * @returns {Promise}
   */
  getQuickStats: async () => {
    const response = await api.get('/dashboard/quick-stats');
    return response.data;
  }
};

export default dashboardService;
