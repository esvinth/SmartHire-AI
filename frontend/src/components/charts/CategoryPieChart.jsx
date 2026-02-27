import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1'];

export default function CategoryPieChart({ categoryBreakdown }) {
  const data = (categoryBreakdown || []).map((item) => ({
    name: item.category,
    value: item.matched,
    total: item.total,
  }));

  if (!data.length) return <p className="text-gray-400 text-sm text-center py-8">No data available</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          innerRadius={50}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={({ name, value, total }) => `${name}: ${value}/${total}`}
          labelLine={{ strokeWidth: 1, stroke: '#9ca3af' }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name, entry) => [`${value} / ${entry.payload.total}`, 'Skills Matched']} />
      </PieChart>
    </ResponsiveContainer>
  );
}
