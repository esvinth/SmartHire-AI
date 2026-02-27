import api from '../config/api';

const adminService = {
  async getStats() {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  async updateUser(id, data) {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },
  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};

export default adminService;
