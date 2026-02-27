import { useState, useEffect } from 'react';
import courseService from '../../services/courseService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/admin/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', provider: '', url: '', description: '', duration: '', level: 'beginner', rating: 0, isFree: false });

  const fetchCourses = async (params = {}) => {
    setLoading(true);
    try {
      const res = await courseService.getAll(params);
      setCourses(res.data.courses);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const openEdit = (course) => {
    setEditing(course);
    setForm({ title: course.title, provider: course.provider, url: course.url, description: course.description, duration: course.duration, level: course.level, rating: course.rating, isFree: course.isFree });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const data = { ...form, rating: parseFloat(form.rating) };
    if (editing) await courseService.update(editing._id, data);
    else await courseService.create(data);
    setModalOpen(false);
    fetchCourses({ page: pagination.page });
  };

  const handleDelete = async () => {
    await courseService.delete(deleteId);
    setDeleteId(null);
    fetchCourses();
  };

  const columns = [
    { key: 'title', label: 'Title', render: (val) => <span className="font-medium text-gray-900">{val}</span> },
    { key: 'provider', label: 'Provider' },
    { key: 'level', label: 'Level', render: (val) => <Badge variant="info" size="sm">{val}</Badge> },
    { key: 'rating', label: 'Rating', align: 'center', render: (val) => `${val}/5` },
    { key: 'isFree', label: 'Free', align: 'center', render: (val) => <Badge variant={val ? 'success' : 'default'} size="sm">{val ? 'Free' : 'Paid'}</Badge> },
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

  if (loading) return <LoadingSpinner text="Loading courses..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
        <Button onClick={() => { setEditing(null); setForm({ title: '', provider: '', url: '', description: '', duration: '', level: 'beginner', rating: 0, isFree: false }); setModalOpen(true); }}>
          Add Course
        </Button>
      </div>
      <SearchBar onSearch={(q) => fetchCourses({ search: q })} placeholder="Search courses..." className="mb-4 max-w-md" />
      <Card>
        <DataTable columns={columns} data={courses} pagination={pagination} onPageChange={(p) => fetchCourses({ page: p })} />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Course' : 'Add Course'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
          <Input label="Provider" value={form.provider} onChange={(e) => setForm({...form, provider: e.target.value})} required />
          <Input label="URL" value={form.url} onChange={(e) => setForm({...form, url: e.target.value})} />
          <Input label="Duration" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} placeholder="e.g., 20 hours" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select value={form.level} onChange={(e) => setForm({...form, level: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <Input label="Rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({...form, rating: e.target.value})} />
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({...form, isFree: e.target.checked})} className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">Free Course</span>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" rows={3} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Course" message="Are you sure you want to delete this course?" confirmText="Delete" />
    </div>
  );
}
