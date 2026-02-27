import { useState, useEffect } from 'react';
import skillService from '../../services/skillService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORIES = ['Programming Languages','Web Frameworks','Databases','Cloud & DevOps','Data Science & ML','Mobile Development','Testing','Tools & Platforms','Soft Skills','Design','Other'];

export default function SkillManagement() {
  const [skills, setSkills] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Programming Languages', aliases: '', weight: 1.0 });

  const fetchSkills = async (params = {}) => {
    setLoading(true);
    try {
      const res = await skillService.getAll(params);
      setSkills(res.data.skills);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSkills(); }, []);

  const openEdit = (skill) => {
    setEditing(skill);
    setForm({ name: skill.name, category: skill.category, aliases: skill.aliases?.join(', ') || '', weight: skill.weight });
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', category: 'Programming Languages', aliases: '', weight: 1.0 });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const data = { ...form, aliases: form.aliases.split(',').map(a => a.trim()).filter(Boolean), weight: parseFloat(form.weight) };
    if (editing) await skillService.update(editing._id, data);
    else await skillService.create(data);
    setModalOpen(false);
    fetchSkills({ page: pagination.page });
  };

  const handleDelete = async () => {
    await skillService.delete(deleteId);
    setDeleteId(null);
    fetchSkills();
  };

  const columns = [
    { key: 'name', label: 'Name', render: (val) => <span className="font-medium text-gray-900">{val}</span> },
    { key: 'category', label: 'Category', render: (val) => <Badge variant="info" size="sm">{val}</Badge> },
    { key: 'weight', label: 'Weight', align: 'center', render: (val) => val?.toFixed(1) },
    { key: 'aliases', label: 'Aliases', render: (val) => <span className="text-xs text-gray-500">{val?.slice(0, 3).join(', ')}{val?.length > 3 ? '...' : ''}</span> },
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

  if (loading) return <LoadingSpinner text="Loading skills..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Skill Management</h1>
        <Button onClick={openCreate}>Add Skill</Button>
      </div>
      <SearchBar onSearch={(q) => fetchSkills({ search: q })} placeholder="Search skills..." className="mb-4 max-w-md" />
      <Card>
        <DataTable columns={columns} data={skills} pagination={pagination} onPageChange={(p) => fetchSkills({ page: p })} />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Skill' : 'Add Skill'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Aliases (comma-separated)" value={form.aliases} onChange={(e) => setForm({...form, aliases: e.target.value})} />
          <Input label="Weight" type="number" min="0.1" max="5" step="0.1" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Skill" message="Are you sure you want to delete this skill?" confirmText="Delete" />
    </div>
  );
}
