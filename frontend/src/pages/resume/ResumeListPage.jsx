import { Link } from 'react-router-dom';
import useResumes from '../../hooks/useResumes';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useState } from 'react';

const statusBadge = {
  uploaded: 'info',
  processing: 'warning',
  processed: 'success',
  failed: 'danger',
};

export default function ResumeListPage() {
  const { resumes, loading, pagination, fetchResumes, deleteResume } = useResumes();
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleSearch = (query) => {
    fetchResumes({ search: query, page: 1 });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteResume(deleteId);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading resumes..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
        <Link to="/resumes/upload">
          <Button>Upload Resume</Button>
        </Link>
      </div>

      <SearchBar onSearch={handleSearch} placeholder="Search resumes..." className="mb-6 max-w-md" />

      {resumes.length === 0 ? (
        <EmptyState
          title="No resumes yet"
          description="Upload your first resume to get started with skill analysis"
          action={<Link to="/resumes/upload"><Button>Upload Resume</Button></Link>}
        />
      ) : (
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <Card key={resume._id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <Link to={`/resumes/${resume._id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600">
                      {resume.originalName}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={statusBadge[resume.status]} size="sm">{resume.status}</Badge>
                      <span className="text-xs text-gray-400">{new Date(resume.createdAt).toLocaleDateString()}</span>
                      <span className="text-xs text-gray-400">{(resume.fileSize / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {resume.status === 'processed' && resume.extractedSkills?.length > 0 && (
                    <span className="text-xs text-gray-500">{resume.extractedSkills.length} skills found</span>
                  )}
                  <Link to={`/resumes/${resume._id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(resume._id)}>
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={(page) => fetchResumes({ page })}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
}
