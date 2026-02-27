import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import analysisService from '../../services/analysisService';
import resumeService from '../../services/resumeService';
import jobRoleService from '../../services/jobRoleService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import Pagination from '../../components/common/Pagination';

export default function AnalysisPage() {
  const [searchParams] = useSearchParams();
  const preselectedResumeId = searchParams.get('resumeId');

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const [showNew, setShowNew] = useState(!!preselectedResumeId);
  const [resumes, setResumes] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [selectedResume, setSelectedResume] = useState(preselectedResumeId || '');
  const [selectedRole, setSelectedRole] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
    fetchFormData();
  }, []);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const res = await analysisService.getAll({ page });
      setReports(res.data.reports);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const [resumeRes, roleRes] = await Promise.all([
        resumeService.getAll({ limit: 100 }),
        jobRoleService.getAll({ limit: 100 }),
      ]);
      setResumes(resumeRes.data.resumes.filter((r) => r.status === 'processed'));
      setJobRoles(roleRes.data.jobRoles || roleRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedResume || !selectedRole) {
      setError('Please select both a resume and a job role');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      const res = await analysisService.analyze(selectedResume, selectedRole);
      setShowNew(false);
      await fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const scoreBadge = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analysis Reports</h1>
        <Button onClick={() => setShowNew(!showNew)}>
          {showNew ? 'Cancel' : 'New Analysis'}
        </Button>
      </div>

      {showNew && (
        <Card className="mb-6" title="Run New Analysis">
          {error && <Toast type="error" message={error} onClose={() => setError('')} />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Resume</label>
              <select
                value={selectedResume}
                onChange={(e) => setSelectedResume(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose a resume...</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>{r.originalName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Job Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose a job role...</option>
                {jobRoles.map((r) => (
                  <option key={r._id} value={r._id}>{r.title}</option>
                ))}
              </select>
            </div>
          </div>
          <Button onClick={handleAnalyze} loading={analyzing}>Run Analysis</Button>
        </Card>
      )}

      {loading ? (
        <LoadingSpinner text="Loading reports..." />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No analysis reports yet"
          description="Upload a resume and run your first analysis"
          action={<Button onClick={() => setShowNew(true)}>New Analysis</Button>}
        />
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Link key={report._id} to={`/analysis/${report._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{report.jobRole?.title || 'Job Role'}</h3>
                    <p className="text-sm text-gray-500 mt-1">{report.resume?.originalName || 'Resume'}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(report.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={scoreBadge(report.overallScore)} size="lg">
                      Score: {Math.round(report.overallScore)}%
                    </Badge>
                    <Badge variant={report.status === 'completed' ? 'success' : report.status === 'failed' ? 'danger' : 'warning'} size="sm">
                      {report.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={fetchReports} />
    </div>
  );
}
