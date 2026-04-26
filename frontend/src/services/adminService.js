import api from './api';

const adminService = {
  /**
   * Get pending users (awaiting approval)
   * @returns {Promise}
   */
  getPendingUsers: async () => {
    const response = await api.get('/admin/pending-users');
    return response.data;
  },

  /**
   * Get all users
   * @returns {Promise}
   */
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  /**
   * Approve a user
   * @param {number} userId - User ID to approve
   * @returns {Promise}
   */
  approveUser: async (userId) => {
    const response = await api.post(`/admin/approve-user/${userId}`);
    return response.data;
  },

  /**
   * Reject (delete) a user
   * @param {number} userId - User ID to reject
   * @returns {Promise}
   */
  rejectUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Toggle user active status
   * @param {number} userId - User ID
   * @param {boolean} isActive - Active status
   * @returns {Promise}
   */
  toggleUserStatus: async (userId, isActive) => {
    const response = await api.post(`/admin/toggle-user/${userId}`, { is_active: isActive });
    return response.data;
  }
};

export default adminService;