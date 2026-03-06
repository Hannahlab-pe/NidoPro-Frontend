import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-medium text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
        <span className="font-semibold text-gray-700">{name}</span>
      </div>
      <p className="text-gray-500 mt-1">{value} estudiantes</p>
    </div>
  );
};

export const StudentsByClassroomChart = ({ data, height = 300 }) => {
  const defaultData = [
    { name: '1ro A', estudiantes: 22, capacidad: 25 },
    { name: '1ro B', estudiantes: 20, capacidad: 25 },
    { name: '2do A', estudiantes: 24, capacidad: 25 },
    { name: '2do B', estudiantes: 18, capacidad: 25 },
  ];
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Ocupación</p>
          <h3 className="text-base font-semibold text-gray-800">Estudiantes por Aula</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />Estudiantes</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" />Capacidad</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f9fafb', radius: 6 }} />
          <Bar dataKey="estudiantes" fill="#10b981" name="Estudiantes" radius={[0, 0, 0, 0]} />
          <Bar dataKey="capacidad" fill="#e5e7eb" name="Capacidad" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

const FALLBACK_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

export const GradesDistributionChart = ({ data, height = 300 }) => {
  const transformedData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [{ name: 'Sin datos', value: 1, color: '#e5e7eb' }];
    }
    const gradeGroups = {};
    data.forEach((item, index) => {
      const grade = item.name?.split(' - ')[0] || `Grado ${index + 1}`;
      if (!gradeGroups[grade]) gradeGroups[grade] = 0;
      gradeGroups[grade] += item.estudiantes || 0;
    });
    return Object.entries(gradeGroups).map(([grade, count], index) => ({
      name: grade,
      value: count,
      color: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    }));
  }, [data]);

  const total = transformedData.reduce((s, d) => s + d.value, 0);

  return (
    <>
      <div className="mb-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Distribución</p>
        <h3 className="text-base font-semibold text-gray-800">Distribución por Grados</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="shrink-0" style={{ width: height * 0.72, height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={transformedData}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {transformedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-3">
          {transformedData.map((entry, index) => {
            const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color }} />
                    <span className="text-xs text-gray-600 font-medium">{entry.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: entry.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default { StudentsByClassroomChart, GradesDistributionChart };