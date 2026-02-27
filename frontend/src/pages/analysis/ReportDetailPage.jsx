import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import analysisService from '../../services/analysisService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MatchScoreGauge from '../../components/charts/MatchScoreGauge';
import SkillRadarChart from '../../components/charts/SkillRadarChart';
import SkillBarChart from '../../components/charts/SkillBarChart';
import CategoryPieChart from '../../components/charts/CategoryPieChart';
import SkillMatchTable from '../../components/analysis/SkillMatchTable';
import GapSummaryCard from '../../components/analysis/GapSummaryCard';
import RoadmapTimeline from '../../components/analysis/RoadmapTimeline';

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analysisService.getById(id).then((res) => {
      setReport(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading report..." />;
  if (!report) return <p className="text-center text-gray-500 mt-10">Report not found</p>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analysis Report</h1>
          <p className="text-gray-500 mt-1">
            {report.resume?.originalName} vs {report.jobRole?.title}
          </p>
        </div>
        <Link to="/analysis">
          <Button variant="secondary">Back to Reports</Button>
        </Link>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="flex flex-col items-center justify-center">
          <MatchScoreGauge score={report.overallScore} />
          <p className="text-sm font-medium text-gray-700 mt-2">Overall Match</p>
        </Card>
        <Card>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">TF-IDF Similarity</span>
                <span className="font-medium">{(report.tfidfScore * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${report.tfidfScore * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Skill Match</span>
                <span className="font-medium">{report.skillMatchScore?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${report.skillMatchScore}%` }} />
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">Formula: 0.4 × TF-IDF + 0.6 × Skill Match</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Matched Skills</span>
              <Badge variant="success">{report.matchedSkills?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Missing Skills</span>
              <Badge variant="danger">{report.missingSkills?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Required</span>
              <Badge variant="info">{report.skillMatches?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Recommendations</span>
              <Badge variant="primary">{report.recommendations?.length || 0}</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Summary */}
      {report.summary && (
        <Card title="Summary" className="mb-6">
          <p className="text-gray-700 text-sm leading-relaxed">{report.summary}</p>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Category Breakdown">
          <SkillRadarChart categoryBreakdown={report.categoryBreakdown} />
        </Card>
        <Card title="Skills Distribution">
          <CategoryPieChart categoryBreakdown={report.categoryBreakdown} />
        </Card>
      </div>

      {/* Skill Match Bar Chart */}
      <Card title="Skill Match Details" className="mb-6">
        <SkillBarChart skillMatches={report.skillMatches} />
      </Card>

      {/* Skill Match Table */}
      <Card title="Detailed Skill Comparison" className="mb-6">
        <SkillMatchTable skillMatches={report.skillMatches} />
      </Card>

      {/* Gap Summary */}
      <div className="mb-6">
        <GapSummaryCard missingSkills={report.missingSkills} />
      </div>

      {/* Learning Roadmap */}
      <RoadmapTimeline recommendations={report.recommendations} />
    </div>
  );
}
