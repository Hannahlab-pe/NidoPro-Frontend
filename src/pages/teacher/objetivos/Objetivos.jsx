import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';

const Objetivos = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Datos fake de metas
  const objetivos = [
    {
      id: 1,
      title: "Completar evaluaciones de Matemáticas",
      description: "Evaluar a todos los estudiantes de 5to grado en operaciones básicas",
      deadline: "2025-08-20",
      progress: 80,
      status: "in-progress",
      priority: "high",
      category: "academic",
      tasks: [
        { id: 1, text: "Preparar examen", completed: true },
        { id: 2, text: "Aplicar evaluación", completed: true },
        { id: 3, text: "Revisar respuestas", completed: false },
        { id: 4, text: "Registrar calificaciones", completed: false }
      ]
    },
    {
      id: 2,
      title: "Mejorar asistencia del aula",
      description: "Aumentar la asistencia promedio del 90% al 95%",
      deadline: "2025-08-30",
      progress: 65,
      status: "in-progress",
      priority: "medium",
      category: "attendance",
      tasks: [
        { id: 1, text: "Contactar padres de familia", completed: true },
        { id: 2, text: "Implementar sistema de recompensas", completed: false },
        { id: 3, text: "Hacer seguimiento semanal", completed: false }
      ]
    },
    {
      id: 3,
      title: "Capacitación en tecnología educativa",
      description: "Completar curso online de herramientas digitales para educación",
      deadline: "2025-09-15",
      progress: 30,
      status: "in-progress",
      priority: "low",
      category: "professional",
      tasks: [
        { id: 1, text: "Módulo 1: Introducción", completed: true },
        { id: 2, text: "Módulo 2: Herramientas básicas", completed: false },
        { id: 3, text: "Módulo 3: Aplicación práctica", completed: false },
        { id: 4, text: "Proyecto final", completed: false }
      ]
    },
    {
      id: 4,
      title: "Implementar juegos educativos",
      description: "Integrar actividades lúdicas en 3 materias diferentes",
      deadline: "2025-08-25",
      progress: 100,
      status: "completed",
      priority: "high",
      category: "innovation",
      tasks: [
        { id: 1, text: "Seleccionar juegos de Matemáticas", completed: true },
        { id: 2, text: "Adaptar juegos de Ciencias", completed: true },
        { id: 3, text: "Crear juego de Historia", completed: true },
        { id: 4, text: "Evaluar efectividad", completed: true }
      ]
    }
  ];

  const stats = [
    {
      title: "Metas Activas",
      value: "8",
      icon: Target,
      color: "#3B82F6",
      change: "+2 esta semana"
    },
    {
      title: "Completadas",
      value: "12",
      icon: CheckCircle,
      color: "#10B981",
      change: "+3 este mes"
    },
    {
      title: "En Progreso",
      value: "5",
      icon: Clock,
      color: "#F59E0B",
      change: "2 por vencer"
    },
    {
      title: "Tasa de Éxito",
      value: "85%",
      icon: TrendingUp,
      color: "#8B5CF6",
      change: "+5% vs mes anterior"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in-progress':
        return 'En Progreso';
      case 'overdue':
        return 'Vencida';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Objetivos" theme="green" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar metas..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
                <option value="year">Este año</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Todos los estados</option>
                <option value="in-progress">En progreso</option>
                <option value="completed">Completadas</option>
                <option value="overdue">Vencidas</option>
              </select>
            </div>
          </div>

          <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nueva Meta</span>
          </button>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {objetivos.map((goal) => (
          <div key={goal.id} className={`bg-white rounded-xl shadow-sm border-l-4 ${getPriorityColor(goal.priority)} border-t border-r border-b border-gray-100 p-6`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(goal.status)}`}>
                    {getStatusText(goal.status)}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{goal.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progreso</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Tareas:</h4>
                  {goal.tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-2">
                      {task.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      )}
                      <span className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-2 ml-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(goal.deadline).toLocaleDateString('es-ES')}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">¿Necesitas ayuda con tus metas?</h3>
            <p className="text-green-100">Nuestro asistente IA puede sugerirte metas personalizadas</p>
          </div>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200">
            Generar Ideas
          </button>
        </div>
      </div>
    </div>
  );
};

export default Objetivos;
