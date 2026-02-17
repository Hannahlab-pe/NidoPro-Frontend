import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const bimestreApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
bimestreApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const bimestreService = {
  async getBimestreActual() {
    const response = await bimestreApi.get('/bimestre/actual');
    return response.data?.bimestre || null;
  },

  async getAllBimestres() {
    const response = await bimestreApi.get('/bimestre');
    return response.data;
  },

  async generarBimestresAutomaticos(idPeriodo) {
    try {
      console.log('📤 Generando bimestres automáticos para período:', idPeriodo);

      const response = await bimestreApi.post(`/bimestre/generar-automaticos/${idPeriodo}`);
      console.log('📥 Bimestres generados:', response.data);

      return response.data?.info?.data || response.data?.data || response.data;
    } catch (error) {
      console.error('Error al generar bimestres:', error);
      throw new Error(error.response?.data?.message || 'Error al generar bimestres');
    }
  },

  async actualizarFechasMasivo(bimestresData) {
    try {
      console.log('📤 Actualizando fechas de bimestres masivamente:', bimestresData);

      const response = await bimestreApi.patch('/bimestre/actualizar-fechas-masivo', {
        bimestres: bimestresData
      });
      console.log('📥 Fechas de bimestres actualizadas:', response.data);

      return response.data?.info?.data || response.data?.data || response.data;
    } catch (error) {
      console.error('Error al actualizar fechas de bimestres:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar fechas de bimestres');
    }
  }
};
