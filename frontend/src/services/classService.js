import api from './api';

const classService = {
  /**
   * Get all classes
   * @param {Object} params - Query params (academic_year, include_students)
   * @returns {Promise}
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/classes?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get class by ID
   * @param {number} id
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  /**
   * Create new class
   * @param {Object} classData
   * @returns {Promise}
   */
  create: async (classData) => {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  /**
   * Update class
   * @param {number} id
   * @param {Object} classData
   * @returns {Promise}
   */
  update: async (id, classData) => {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data;
  },

  /**
   * Delete class
   * @param {number} id
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },

  /**
   * Get available academic years
   * @returns {Promise}
   */
  getAcademicYears: async () => {
    const response = await api.get('/classes');
    return response.data;
  }
};

export default classService;
