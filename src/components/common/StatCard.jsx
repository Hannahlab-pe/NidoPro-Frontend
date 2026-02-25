import React from "react";

/**
 * Tarjeta de estadística reutilizable - estilo admin (fondo blanco, sombra, icono con color).
 * Props:
 *   icon  - componente de lucide-react
 *   label - texto descriptivo (ej: "Total")
 *   value - valor a mostrar (número o string)
 *   color - color hex del ícono y su fondo translúcido (ej: "#16a34a")
 */
const StatCard = ({ icon: Icon, label, value, color = "#6b7280" }) => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
    <div className="flex items-center gap-3">
      <div
        className="p-2.5 rounded-lg shrink-0"
        style={{ backgroundColor: `${color}1a` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default StatCard;
