import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const statCards = [
  { key: 'users', label: 'Total Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', color: 'bg-blue-100 text-blue-600', link: '/admin/users' },
  { key: 'resumes', label: 'Resumes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-green-100 text-green-600' },
  { key: 'analyses', label: 'Analyses', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'bg-purple-100 text-purple-600' },
  { key: 'skills', label: 'Skills', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'bg-yellow-100 text-yellow-600', link: '/admin/skills' },
  { key: 'courses', label: 'Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253', color: 'bg-pink-100 text-pink-600', link: '/admin/courses' },
  { key: 'jobRoles', label: 'Job Roles', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'bg-indigo-100 text-indigo-600', link: '/admin/job-roles' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats().then((res) => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading admin dashboard..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => {
          const Wrapper = card.link ? Link : 'div';
          return (
            <Wrapper key={card.key} to={card.link || '#'} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.counts?.[card.key] || 0}</p>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                </div>
              </Card>
            </Wrapper>
          );
        })}
      </div>

      {stats?.recentAnalyses?.length > 0 && (
        <Card title="Recent Analyses">
          <div className="space-y-3">
            {stats.recentAnalyses.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{a.jobRole?.title || 'Analysis'}</p>
                  <p className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</p>
                </div>
                <span className={`text-sm font-bold ${a.overallScore >= 70 ? 'text-green-600' : a.overallScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {Math.round(a.overallScore)}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
