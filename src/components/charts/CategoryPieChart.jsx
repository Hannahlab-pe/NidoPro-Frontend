import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const FALLBACK_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
        <span className="font-semibold text-gray-700">{name}</span>
      </div>
      <p className="text-gray-500 mt-1">{value} personas</p>
    </div>
  );
};

const CategoryPieChart = ({ data, title, height = 300 }) => {
  const defaultData = [
    { name: 'Docentes', value: 18, color: '#3b82f6' },
    { name: 'Administrativos', value: 6, color: '#10b981' },
    { name: 'Auxiliares', value: 4, color: '#f59e0b' },
  ];

  const chartData = data || defaultData;
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Distribución</p>
        <h3 className="text-base font-semibold text-gray-800">{title || 'Distribución por Categorías'}</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="shrink-0" style={{ width: height * 0.72, height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {chartData.map((entry, index) => {
            const color = entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
            const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-xs text-gray-600 font-medium">{entry.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CategoryPieChart;