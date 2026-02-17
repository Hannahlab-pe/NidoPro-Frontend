import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const planificacionApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const planificacionService = {
  async getPlanificaciones(params = {}) {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams();
    
    if (params.idTrabajador) {
      queryParams.append('idTrabajador', params.idTrabajador);
    }

    const url = `/planificacion${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await planificacionApi.get(url, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'accept': '*/*'
      }
    });
    return response.data;
  },

  async getAulasTrabajador(idTrabajador) {
    const token = localStorage.getItem('token');
    console.log('🔑 Token para petición de aulas:', token ? 'Presente' : 'No encontrado');
    console.log('👤 ID del trabajador:', idTrabajador);
    console.log('🌐 URL completa:', `${API_BASE_URL}/trabajador/aulas/${idTrabajador}`);

    try {
      const response = await planificacionApi.get(`/trabajador/aulas/${idTrabajador}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'accept': '*/*'
        }
      });
      console.log('📨 Respuesta completa del API:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Error en la petición de aulas:', error);
      console.error('❌ Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  async getPlanificacionesTrabajador(idTrabajador) {
    const token = localStorage.getItem('token');
    const response = await planificacionApi.get(`/planificacion/trabajador/${idTrabajador}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'accept': '*/*'
      }
    });
    return response.data;
  },

  async crearPlanificacion(planificacionData) {
    const token = localStorage.getItem('token');
    console.log('📤 Enviando datos de planificación:', planificacionData);
    
    try {
      const response = await planificacionApi.post('/planificacion', planificacionData, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'accept': '*/*'
        }
      });
      console.log('✅ Planificación creada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear planificación:', error);
      console.error('❌ Detalles del error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },
};
