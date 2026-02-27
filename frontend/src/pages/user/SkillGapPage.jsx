import { useState, useEffect } from 'react';
import analysisService from '../../services/analysisService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';

export default function SkillGapPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analysisService.getAll({ limit: 50 }).then((res) => {
      setReports(res.data.reports.filter((r) => r.status === 'completed'));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading skill gap data..." />;

  if (!reports.length) {
    return (
      <EmptyState
        title="No skill gap data"
        description="Run an analysis first to see your skill gaps"
        action={<Link to="/analysis"><Button>Go to Analysis</Button></Link>}
      />
    );
  }

  const allMissing = {};
  reports.forEach((r) => {
    (r.missingSkills || []).forEach((s) => {
      if (!allMissing[s.skillName]) {
        allMissing[s.skillName] = { ...s, count: 0 };
      }
      allMissing[s.skillName].count++;
    });
  });

  const sortedGaps = Object.values(allMissing).sort((a, b) => b.count - a.count);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Skill Gap Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-500">{sortedGaps.length}</p>
            <p className="text-sm text-gray-500 mt-1">Unique Gaps</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-500">{sortedGaps.filter(s => s.weight >= 2).length}</p>
            <p className="text-sm text-gray-500 mt-1">High Priority</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{reports.length}</p>
            <p className="text-sm text-gray-500 mt-1">Analyses Done</p>
          </div>
        </Card>
      </div>

      <Card title="Most Common Skill Gaps" subtitle="Skills missing across your analyses">
        {sortedGaps.length === 0 ? (
          <p className="text-green-600">No gaps found across analyses!</p>
        ) : (
          <div className="space-y-3">
            {sortedGaps.map((gap, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{gap.skillName}</span>
                  <Badge variant="default" size="sm">{gap.category}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Missing in {gap.count} {gap.count === 1 ? 'analysis' : 'analyses'}</span>
                  <Badge variant={gap.weight >= 2 ? 'danger' : gap.weight >= 1 ? 'warning' : 'default'} size="sm">
                    {gap.weight >= 2 ? 'High' : gap.weight >= 1 ? 'Medium' : 'Low'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
