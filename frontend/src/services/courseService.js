import api from '../config/api';

const courseService = {
  async getAll(params = {}) {
    const response = await api.get('/courses', { params });
    return response.data;
  },
  async getById(id) {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },
  async create(data) {
    const response = await api.post('/courses', data);
    return response.data;
  },
  async update(id, data) {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },
  async delete(id) {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};

export default courseService;
