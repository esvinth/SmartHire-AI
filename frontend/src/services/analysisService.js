import api from '../config/api';

const analysisService = {
  async analyze(resumeId, jobRoleId) {
    const response = await api.post('/analysis', { resumeId, jobRoleId });
    return response.data;
  },

  async getAll(params = {}) {
    const response = await api.get('/analysis', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/analysis/${id}`);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/analysis/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/analysis/stats');
    return response.data;
  },
};

export default analysisService;
