import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function SkillRadarChart({ categoryBreakdown }) {
  const data = (categoryBreakdown || []).map((item) => ({
    category: item.category.length > 15 ? item.category.substring(0, 13) + '...' : item.category,
    fullCategory: item.category,
    percentage: item.percentage,
  }));

  if (!data.length) return <p className="text-gray-400 text-sm text-center py-8">No data available</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#6b7280' }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
        <Radar name="Match %" dataKey="percentage" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
        <Tooltip formatter={(value) => [`${Math.round(value)}%`, 'Match']} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
