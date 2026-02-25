/**
 * Servicio para gestión de movimientos de caja
 */

const API_BASE_URL = import.meta.env.VITE_API_URL;

const cajaService = {
  /**
   * Obtener todos los movimientos de caja
   */
  async obtenerMovimientos(filtros = {}) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autorización no encontrado');
      }

      console.log('🔍 Obteniendo movimientos de caja...');
      console.log('🔐 Token:', token ? 'Token presente' : 'Token no encontrado');

      const params = new URLSearchParams();
      if (filtros.mes) params.append('mes', filtros.mes);
      if (filtros.anio) params.append('anio', filtros.anio);
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);

      const query = params.toString();
      const url = query ? `${API_BASE_URL}/caja-simple?${query}` : `${API_BASE_URL}/caja-simple`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });


      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 Movimientos obtenidos:', data);
      
      const movimientos = Array.isArray(data)
        ? data
        : data?.info?.data || data?.data || data?.movimientos || [];

      return {
        success: true,
        movimientos: Array.isArray(movimientos) ? movimientos : []
      };

    } catch (error) {
      console.error('❌ Error al obtener movimientos:', error);
      throw new Error(error.message || 'Error al obtener movimientos de caja');
    }
  },

  /**
   * Crear un nuevo movimiento de caja
   */
  async crearMovimiento(datosMovimiento) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autorización no encontrado');
      }

      console.log('📤 Creando movimiento de caja:', datosMovimiento);

      const response = await fetch(`${API_BASE_URL}/caja-simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosMovimiento)
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Movimiento creado:', data);
      
      return {
        success: true,
        movimiento: data
      };

    } catch (error) {
      console.error('❌ Error al crear movimiento:', error);
      throw new Error(error.message || 'Error al crear movimiento de caja');
    }
  },

  /**
   * Obtener saldo actual de caja
   */
  async obtenerSaldo() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autorización no encontrado');
      }

      console.log('🔍 Obteniendo saldo de caja...');

      const response = await fetch(`${API_BASE_URL}/caja-simple/saldo`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });


      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('💰 Saldo obtenido:', data);
      
      return {
        success: true,
        saldo: data.saldo,
        ingresos: data.ingresos,
        egresos: data.egresos
      };

    } catch (error) {
      console.error('❌ Error al obtener saldo:', error);
      throw new Error(error.message || 'Error al obtener saldo de caja');
    }
  },

  /**
   * Actualizar un movimiento de caja
   */
  async actualizarMovimiento(idMovimiento, datosActualizacion) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autorización no encontrado');
      }

      console.log('📝 Actualizando movimiento de caja:', idMovimiento, datosActualizacion);

      const response = await fetch(`${API_BASE_URL}/caja-simple/${idMovimiento}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosActualizacion)
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Movimiento actualizado:', data);
      
      return {
        success: true,
        movimiento: data
      };

    } catch (error) {
      console.error('❌ Error al actualizar movimiento:', error);
      throw new Error(error.message || 'Error al actualizar movimiento de caja');
    }
  },

  /**
   * Obtener resumen mensual de caja
   */
  async obtenerResumen(mes, anio) {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token de autorización no encontrado');
      }

      const params = new URLSearchParams();
      if (mes) params.append('mes', mes);
      if (anio) params.append('anio', anio);

      const url = `${API_BASE_URL}/caja-simple/resumen?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, resumen: data };

    } catch (error) {
      console.error('❌ Error al obtener resumen de caja:', error);
      throw new Error(error.message || 'Error al obtener resumen de caja');
    }
  },

  /**
   * Obtener dashboard financiero general
   */
  async obtenerDashboardFinanciero() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autorización no encontrado');
      }


      const response = await fetch(`${API_BASE_URL}/caja-simple/reportes/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });


      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        dashboard: data
      };

    } catch (error) {
      console.error('❌ Error al obtener dashboard financiero:', error);
      throw new Error(error.message || 'Error al obtener dashboard financiero');
    }
  },

  /**
   * Obtener ingresos paginados
   */
  async obtenerIngresosPaginados({ page = 1, limit = 15, mes, anio }) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autorización no encontrado');
      }

      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (mes) params.append('mes', mes);
      if (anio) params.append('anio', anio);

      const url = `${API_BASE_URL}/caja-simple/ingresos?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data || [],
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 1
      };

    } catch (error) {
      console.error('❌ Error al obtener ingresos paginados:', error);
      throw new Error(error.message || 'Error al obtener ingresos paginados');
    }
  },

  /**
   * Obtener egresos paginados
   */
  async obtenerEgresosPaginados({ page = 1, limit = 15, mes, anio }) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autorización no encontrado');
      }

      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (mes) params.append('mes', mes);
      if (anio) params.append('anio', anio);

      const url = `${API_BASE_URL}/caja-simple/egresos?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data || [],
        total: data.total || 0,
        page: data.page || 1,
        totalPages: data.totalPages || 1
      };

    } catch (error) {
      console.error('❌ Error al obtener egresos paginados:', error);
      throw new Error(error.message || 'Error al obtener egresos paginados');
    }
  },
};

export default cajaService;
