import { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = async (params = {}) => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(params);
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, role) => {
    await adminService.updateUser(userId, { role });
    fetchUsers({ page: pagination.page });
  };

  const handleToggleActive = async (userId, isActive) => {
    await adminService.updateUser(userId, { isActive: !isActive });
    fetchUsers({ page: pagination.page });
  };

  const handleDelete = async () => {
    await adminService.deleteUser(deleteId);
    setDeleteId(null);
    fetchUsers();
  };

  const columns = [
    { key: 'name', label: 'Name', render: (val) => <span className="font-medium text-gray-900">{val}</span> },
    { key: 'email', label: 'Email' },
    {
      key: 'role', label: 'Role', render: (val, row) => (
        <select value={val} onChange={(e) => handleRoleChange(row._id, e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1">
          <option value="user">User</option>
          <option value="hr">HR</option>
          <option value="admin">Admin</option>
        </select>
      ),
    },
    {
      key: 'isActive', label: 'Status', align: 'center', render: (val, row) => (
        <button onClick={() => handleToggleActive(row._id, val)}>
          <Badge variant={val ? 'success' : 'danger'}>{val ? 'Active' : 'Inactive'}</Badge>
        </button>
      ),
    },
    { key: 'createdAt', label: 'Joined', render: (val) => new Date(val).toLocaleDateString() },
    {
      key: 'actions', label: '', align: 'center', render: (_, row) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteId(row._id); }}>
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      ),
    },
  ];

  if (loading) return <LoadingSpinner text="Loading users..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>
      <SearchBar onSearch={(q) => fetchUsers({ search: q })} placeholder="Search users..." className="mb-4 max-w-md" />
      <Card>
        <DataTable columns={columns} data={users} pagination={pagination} onPageChange={(p) => fetchUsers({ page: p })} />
      </Card>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete User" message="Are you sure you want to delete this user?" confirmText="Delete" />
    </div>
  );
}
