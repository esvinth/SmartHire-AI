import { useState, useEffect } from 'react';
import jobRoleService from '../../services/jobRoleService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function JobRoleManagement() {
  const [jobRoles, setJobRoles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', department: 'Engineering', experienceLevel: 'mid' });

  const fetchJobRoles = async (params = {}) => {
    setLoading(true);
    try {
      const res = await jobRoleService.getAll(params);
      setJobRoles(res.data.jobRoles);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobRoles(); }, []);

  const openEdit = (role) => {
    setEditing(role);
    setForm({ title: role.title, description: role.description, department: role.department, experienceLevel: role.experienceLevel });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (editing) await jobRoleService.update(editing._id, form);
    else await jobRoleService.create(form);
    setModalOpen(false);
    fetchJobRoles({ page: pagination.page });
  };

  const handleDelete = async () => {
    await jobRoleService.delete(deleteId);
    setDeleteId(null);
    fetchJobRoles();
  };

  const columns = [
    { key: 'title', label: 'Title', render: (val) => <span className="font-medium text-gray-900">{val}</span> },
    { key: 'department', label: 'Department' },
    { key: 'experienceLevel', label: 'Level', render: (val) => <Badge variant="info" size="sm">{val}</Badge> },
    { key: 'requiredSkills', label: 'Skills', render: (val) => <span className="text-sm text-gray-500">{val?.length || 0} skills</span> },
    { key: 'actions', label: '', align: 'center', render: (_, row) => (
      <div className="flex gap-1 justify-center">
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>Edit</Button>
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteId(row._id); }}>
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    )},
  ];

  if (loading) return <LoadingSpinner text="Loading job roles..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Role Management</h1>
        <Button onClick={() => { setEditing(null); setForm({ title: '', description: '', department: 'Engineering', experienceLevel: 'mid' }); setModalOpen(true); }}>
          Add Job Role
        </Button>
      </div>
      <SearchBar onSearch={(q) => fetchJobRoles({ search: q })} placeholder="Search job roles..." className="mb-4 max-w-md" />
      <Card>
        <DataTable columns={columns} data={jobRoles} pagination={pagination} onPageChange={(p) => fetchJobRoles({ page: p })} />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Job Role' : 'Add Job Role'}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" rows={3} />
          </div>
          <Input label="Department" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
            <select value={form.experienceLevel} onChange={(e) => setForm({...form, experienceLevel: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
              <option value="principal">Principal</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Job Role" message="Are you sure you want to delete this job role?" confirmText="Delete" />
    </div>
  );
}
