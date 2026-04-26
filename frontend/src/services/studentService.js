import api from './api';

const studentService = {
  /**
   * Get all students
   * @param {Object} params - Query params (page, limit, search, class_id, status)
   * @returns {Promise}
   */
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await api.get(`/students?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Get student by ID
   * @param {number} id
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  /**
   * Create new student
   * @param {Object} studentData
   * @returns {Promise}
   */
  create: async (studentData) => {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  /**
   * Update student
   * @param {number} id
   * @param {Object} studentData
   * @returns {Promise}
   */
  update: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  /**
   * Delete student
   * @param {number} id
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  /**
   * Get students by class
   * @param {number} classId
   * @returns {Promise}
   */
  getByClass: async (classId) => {
    const response = await api.get(`/students?class_id=${classId}`);
    return response.data;
  }
};

export default studentService;
