import api from '../config/api';

const resumeService = {
  async upload(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getAll(params = {}) {
    const response = await api.get('/resumes', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },

  async reprocess(id) {
    const response = await api.post(`/resumes/${id}/reprocess`);
    return response.data;
  },
};

export default resumeService;
