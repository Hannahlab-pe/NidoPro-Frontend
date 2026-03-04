// src/pages/parent/anotaciones/Anotaciones.jsx
import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  Calendar, 
  User, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  Info,
  Search,
  Filter
} from 'lucide-react'
import { useAuthStore } from '../../../store/useAuthStore'
import { useAnotacionesPadre } from '../../../hooks/useAnotacionesPadreNew'
import PageHeader from '../../../components/common/PageHeader'

const Anotaciones = () => {
  const { user } = useAuthStore()
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: 'all',
    fechaDesde: '',
    fechaHasta: ''
  })

  // Obtener las anotaciones de los hijos del padre logueado
  const { 
    data: anotaciones = [], 
    isLoading, 
    error, 
    isError 
  } = useAnotacionesPadre()

  // Categorías de anotaciones para filtrado
  const categorias = [
    { id: 'all', nombre: 'Todas', color: '#6B7280', icon: Bell },
  ]

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoriaColor = (categoria) => {
    const cat = categorias.find(c => c.id === categoria)
    return cat ? cat.color : '#6B7280'
  }

  const getCategoriaIcon = (categoria) => {
    const cat = categorias.find(c => c.id === categoria)
    return cat ? cat.icon : Bell
  }

  // Estado de carga
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Anotaciones y Avisos" theme="yellow" />
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Anotaciones y Avisos</h1>
              <p className="text-gray-600">Observaciones de los profesores sobre tu hijo/a</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Cargando anotaciones...</p>
          </div>
        </div>
      </div>
    )
  }

  // Estado de error
  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Anotaciones y Avisos" theme="yellow" />
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Anotaciones y Avisos</h1>
              <p className="text-gray-600">Observaciones de los profesores sobre tu hijo/a</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar las anotaciones</h3>
              <p className="text-gray-600 mb-4">{error?.message || 'Ocurrió un error inesperado'}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Validar que anotaciones sea un array, si no, usar array vacío
  const anotacionesArray = Array.isArray(anotaciones) ? anotaciones : [];
  
  // Debug: Ver qué estamos recibiendo
  console.log('📋 Anotaciones recibidas:', anotaciones);
  console.log('📋 Es array?', Array.isArray(anotaciones));
  console.log('📋 Array final:', anotacionesArray);

  // Filtrar anotaciones
  const anotacionesFiltradas = anotacionesArray.filter(anotacion => {
    // Filtro por búsqueda
    if (filtros.busqueda && !anotacion.titulo?.toLowerCase().includes(filtros.busqueda.toLowerCase()) && 
        !anotacion.observacion?.toLowerCase().includes(filtros.busqueda.toLowerCase())) {
      return false
    }

    // Filtro por categoría
    if (filtros.categoria !== 'all' && anotacion.categoria !== filtros.categoria) {
      return false
    }

    // Filtro por fecha desde
    if (filtros.fechaDesde && new Date(anotacion.fecha) < new Date(filtros.fechaDesde)) {
      return false
    }

    // Filtro por fecha hasta
    if (filtros.fechaHasta && new Date(anotacion.fecha) > new Date(filtros.fechaHasta)) {
      return false
    }

    return true
  })

  // Calcular estadísticas por categoría
  const getConteoCategoria = (categoriaId) => {
    return anotacionesFiltradas.filter(a => a.categoria === categoriaId).length
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Anotaciones y Avisos" theme="yellow" />

      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Anotaciones y Avisos</h2>
            <p className="text-gray-600">Revisa las observaciones de los profesores sobre tu hijo/a</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 mt-6">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar en anotaciones..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="w-full lg:w-48">
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha desde */}
          <div className="w-full lg:w-40">
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha hasta */}
          <div className="w-full lg:w-40">
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {categorias.filter(cat => cat.id !== 'all').map((categoria) => {
          const IconComponent = categoria.icon
          const count = getConteoCategoria(categoria.id)
          return (
            <div key={categoria.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{categoria.nombre}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <IconComponent className="w-8 h-8" style={{ color: categoria.color }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Lista de anotaciones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Historial de Anotaciones</h2>
        </div>

        <div className="p-6">
          {anotacionesFiltradas.length === 0 ? (
            // Estado vacío
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {anotacionesArray.length === 0 ? 'No hay anotaciones' : 'No se encontraron anotaciones'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {anotacionesArray.length === 0 
                  ? 'Aún no se han registrado anotaciones para tu hijo/a. Cuando los profesores registren observaciones, aparecerán aquí.'
                  : 'No se encontraron anotaciones que coincidan con los filtros aplicados. Intenta ajustar los criterios de búsqueda.'
                }
              </p>
            </div>
          ) : (
            // Lista de anotaciones
            <div className="space-y-4">
              {anotacionesFiltradas.map((anotacion) => {
                const IconComponent = getCategoriaIcon(anotacion.categoria)
                const categoriaColor = getCategoriaColor(anotacion.categoria)
                
                return (
                  <div key={anotacion.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div 
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${categoriaColor}20` }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: categoriaColor }} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{anotacion.titulo}</h4>
                          <span className="text-sm text-gray-500">{formatDate(anotacion.fecha)}</span>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{anotacion.observacion}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>Prof. {anotacion.profesor}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <BookOpen className="w-4 h-4" />
                              <span>{anotacion.curso}</span>
                            </div>
                          </div>
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${categoriaColor}20`,
                              color: categoriaColor
                            }}
                          >
                            {categorias.find(c => c.id === anotacion.categoria)?.nombre}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Anotaciones
