import Badge from '../common/Badge';

export default function SkillMatchTable({ skillMatches }) {
  if (!skillMatches?.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-500">Skill</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
            <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
            <th className="text-center py-3 px-4 font-medium text-gray-500">Weight</th>
            <th className="text-center py-3 px-4 font-medium text-gray-500">Score</th>
          </tr>
        </thead>
        <tbody>
          {skillMatches.map((match, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 font-medium text-gray-900">{match.skillName}</td>
              <td className="py-3 px-4 text-gray-600">{match.category}</td>
              <td className="py-3 px-4 text-center">
                <Badge variant={match.found ? 'success' : 'danger'} size="sm">
                  {match.found ? 'Matched' : 'Missing'}
                </Badge>
              </td>
              <td className="py-3 px-4 text-center text-gray-600">{match.weight?.toFixed(1)}</td>
              <td className="py-3 px-4 text-center">
                <span className={`font-medium ${match.found ? 'text-green-600' : 'text-red-500'}`}>
                  {Math.round(match.score || 0)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
