import api from '../config/api';

const jobRoleService = {
  async getAll(params = {}) {
    const response = await api.get('/job-roles', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/job-roles/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/job-roles', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/job-roles/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/job-roles/${id}`);
    return response.data;
  },
};

export default jobRoleService;
