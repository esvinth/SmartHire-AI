import api from '../config/api';

const skillService = {
  async getAll(params = {}) {
    const response = await api.get('/skills', { params });
    return response.data;
  },
  async getById(id) {
    const response = await api.get(`/skills/${id}`);
    return response.data;
  },
  async create(data) {
    const response = await api.post('/skills', data);
    return response.data;
  },
  async update(id, data) {
    const response = await api.put(`/skills/${id}`, data);
    return response.data;
  },
  async delete(id) {
    const response = await api.delete(`/skills/${id}`);
    return response.data;
  },
};

export default skillService;
