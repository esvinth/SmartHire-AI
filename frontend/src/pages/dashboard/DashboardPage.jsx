import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import analysisService from '../../services/analysisService';
import resumeService from '../../services/resumeService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TrendLineChart from '../../components/charts/TrendLineChart';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentResumes, setRecentResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analysisService.getStats(),
      resumeService.getAll({ limit: 5 }),
    ]).then(([statsRes, resumeRes]) => {
      setStats(statsRes.data);
      setRecentResumes(resumeRes.data.resumes);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">Here's your resume screening overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{stats?.totalAnalyses || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Total Analyses</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats?.avgScore || 0}%</p>
            <p className="text-sm text-gray-500 mt-1">Average Score</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{recentResumes.length}</p>
            <p className="text-sm text-gray-500 mt-1">Resumes Uploaded</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Score Trend" headerAction={<Link to="/analysis"><Button variant="ghost" size="sm">View All</Button></Link>}>
          <TrendLineChart trend={stats?.trend} />
        </Card>

        <Card title="Recent Resumes" headerAction={<Link to="/resumes/upload"><Button size="sm">Upload</Button></Link>}>
          {recentResumes.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No resumes uploaded yet</p>
          ) : (
            <div className="space-y-3">
              {recentResumes.map((r) => (
                <Link key={r._id} to={`/resumes/${r._id}`} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.originalName}</p>
                      <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={r.status === 'processed' ? 'success' : r.status === 'failed' ? 'danger' : 'warning'} size="sm">
                    {r.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="flex gap-4">
        <Link to="/resumes/upload"><Button>Upload Resume</Button></Link>
        <Link to="/analysis"><Button variant="outline">View Reports</Button></Link>
      </div>
    </div>
  );
}
