import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const LINES = [
  { key: 'ingresos', label: 'Ingresos', color: '#10b981', fill: '#10b98118' },
  { key: 'egresos',  label: 'Egresos',  color: '#f87171', fill: '#f8717118' },
  { key: 'utilidad', label: 'Utilidad', color: '#3b82f6', fill: '#3b82f618' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm min-w-[140px]">
      <p className="font-semibold text-gray-600 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.stroke }} />
            <span className="text-gray-500">{p.name}</span>
          </div>
          <span className="font-semibold text-gray-800">S/ {p.value?.toLocaleString() || 0}</span>
        </div>
      ))}
    </div>
  );
};

const FinancialTrendChart = ({ data, title, height = 300 }) => {
  const defaultData = [
    { mes: 'Ago', ingresos: 12000, egresos: 8500,  utilidad: 3500 },
    { mes: 'Sep', ingresos: 15000, egresos: 9200,  utilidad: 5800 },
    { mes: 'Oct', ingresos: 13500, egresos: 8800,  utilidad: 4700 },
    { mes: 'Nov', ingresos: 16800, egresos: 9500,  utilidad: 7300 },
    { mes: 'Dic', ingresos: 15600, egresos: 9300,  utilidad: 6300 },
  ];

  const chartData = data || defaultData;

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Finanzas</p>
          <h3 className="text-base font-semibold text-gray-800">{title || 'Tendencias Financieras'}</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {LINES.map((l) => (
            <span key={l.key} className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            {LINES.map((l) => (
              <linearGradient key={l.key} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={l.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={l.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
          {LINES.map((l) => (
            <Area
              key={l.key}
              type="monotone"
              dataKey={l.key}
              stroke={l.color}
              strokeWidth={2}
              fill={`url(#grad-${l.key})`}
              name={l.label}
              dot={false}
              activeDot={{ r: 4, fill: l.color, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default FinancialTrendChart;