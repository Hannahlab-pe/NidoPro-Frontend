// Servicio para grados académicos
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const gradosApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const gradosService = {
  async crearGrado(data) {
    const token = localStorage.getItem('token');
    const response = await gradosApi.post('/grado', data, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  async listarGrados() {
    const token = localStorage.getItem('token');
    const response = await gradosApi.get('/grado', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  },
  // Aquí puedes agregar más métodos (editar, etc.)
};

export default gradosService;
