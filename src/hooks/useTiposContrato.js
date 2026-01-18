// src/hooks/useTiposContrato.js
import { useState, useEffect } from 'react';
import { tipoContratoService } from '../services/tipoContratoService';

export const useTiposContrato = () => {
  const [tiposContrato, setTiposContrato] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTiposContrato = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando tipos de contrato...');

      const data = await tipoContratoService.getAllTiposContrato();
      setTiposContrato(data);
      console.log('✅ Tipos de contrato cargados:', data);

    } catch (err) {
      console.error('❌ Error al cargar tipos de contrato:', err);
      setError(err.message);
      // En caso de error, mantener los tipos de contrato vacíos
      setTiposContrato([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiposContrato();
  }, []);

  const refetch = () => {
    fetchTiposContrato();
  };

  return {
    tiposContrato,
    loading,
    error,
    refetch
  };
};

export default useTiposContrato;
