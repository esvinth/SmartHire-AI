import Card from '../common/Card';
import Badge from '../common/Badge';

export default function GapSummaryCard({ missingSkills }) {
  if (!missingSkills?.length) {
    return (
      <Card title="Skill Gaps">
        <p className="text-green-600 font-medium">No skill gaps found! Great match.</p>
      </Card>
    );
  }

  const byImportance = {
    high: missingSkills.filter((s) => s.importance === 'high' || s.weight >= 2),
    medium: missingSkills.filter((s) => s.importance === 'medium' || (s.weight >= 1 && s.weight < 2)),
    low: missingSkills.filter((s) => s.importance === 'low' || s.weight < 1),
  };

  return (
    <Card title="Skill Gaps" subtitle={`${missingSkills.length} missing skills identified`}>
      <div className="space-y-4">
        {byImportance.high.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-600 mb-2">High Priority</h4>
            <div className="flex flex-wrap gap-2">
              {byImportance.high.map((s, i) => (
                <Badge key={i} variant="danger">{s.skillName}</Badge>
              ))}
            </div>
          </div>
        )}
        {byImportance.medium.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-yellow-600 mb-2">Medium Priority</h4>
            <div className="flex flex-wrap gap-2">
              {byImportance.medium.map((s, i) => (
                <Badge key={i} variant="warning">{s.skillName}</Badge>
              ))}
            </div>
          </div>
        )}
        {byImportance.low.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Nice to Have</h4>
            <div className="flex flex-wrap gap-2">
              {byImportance.low.map((s, i) => (
                <Badge key={i} variant="default">{s.skillName}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
