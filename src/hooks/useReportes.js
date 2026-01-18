// src/hooks/useReportes.js
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import reporteService from '../services/reporteService'; // Asegúrate de tener este servicio

// Query Keys para reportes
const reportesKeys = {
    all: ['reportes'],
    lists: () => [...reportesKeys.all, 'list'],
    list: (filters) => [...reportesKeys.lists(), { filters }],
    details: () => [...reportesKeys.all, 'detail'],
    detail: (id) => [...reportesKeys.details(), id],
    statistics: () => [...reportesKeys.all, 'statistics']
};

/**
 * Hook personalizado para gestionar reportes con TanStack Query
 * Combina queries, mutations, cache y lógica de negocio en un solo lugar
 */
export const useReportes = (initialFilters = {}) => {
    const queryClient = useQueryClient();
    
    // Estado para filtros y búsqueda
    const [filters, setFilters] = useState({
        category: '',
        status: '',
        search: '',
        ...initialFilters
    });

    // Query principal para obtener reportes
    const { 
        data: rawReportes, 
        isLoading: loading, 
        error,
        refetch: refetchReportes 
    } = useQuery({
        queryKey: reportesKeys.list(filters),
// ✅ CORRECTO - El servicio ya devuelve el array limpio
        queryFn: async () => {
            const response = await reporteService.getAllReportes(filters);
            console.log('Datos recibidos en el hook:', response);
            
            // El servicio ya devuelve el array de datos directamente
            return Array.isArray(response) ? response : [];
        },
                staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const reportes = Array.isArray(rawReportes) ? rawReportes : [];

    // Mutations con cache automático
    const generateMutation = useMutation({
        mutationFn: (reportData) => reporteService.generateReport(reportData),
        onMutate: () => {
            const loadingToast = toast.loading('Generando reporte...', {
                description: 'El reporte puede tardar unos minutos en estar listo.'
            });
            return { loadingToast };
        },
        onSuccess: (newReport, variables, context) => {
            queryClient.invalidateQueries({ queryKey: reportesKeys.lists() });
            queryClient.invalidateQueries({ queryKey: reportesKeys.statistics() });
            
            toast.success('Reporte generado exitosamente', {
                id: context.loadingToast,
                description: `El reporte "${newReport.name}" está listo para descargar.`
            });
        },
        onError: (error, variables, context) => {
            toast.error('Error al generar reporte', {
                id: context?.loadingToast,
                description: error.message || 'Ha ocurrido un error inesperado'
            });
        },
    });

    // --- Sección de Estadísticas ---
    const statistics = useMemo(() => {
        if (!reportes || reportes.length === 0) {
            return {
                total: 0,
                available: 0,
                generating: 0,
                pending: 0,
                byCategory: {},
                generatedToday: 0
            };
        }

        const total = reportes.length;
        const available = reportes.filter(r => r.status === 'available').length;
        const generating = reportes.filter(r => r.status === 'generating').length;
        const pending = total - available - generating;

        const byCategory = reportes.reduce((acc, reporte) => {
            const category = reporte.category || 'Sin categoría';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        
        const today = new Date().toISOString().slice(0, 10);
        const generatedToday = reportes.filter(r => 
            r.lastGenerated && r.lastGenerated.startsWith(today)
        ).length;

        return {
            total,
            available,
            generating,
            pending,
            byCategory,
            generatedToday,
        };
    }, [reportes]);

    // Funciones de mutación
    const generateReport = useCallback(async (reportData) => {
        return generateMutation.mutateAsync(reportData);
    }, [generateMutation]);

    // Funciones de filtrado y búsqueda
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            category: '',
            status: '',
            search: ''
        });
    }, []);

    const searchReportes = useCallback((searchTerm) => {
        updateFilters({ search: searchTerm });
    }, [updateFilters]);
    
    const filterByCategory = useCallback((category) => {
        updateFilters({ category });
    }, [updateFilters]);

    const filterByStatus = useCallback((status) => {
        updateFilters({ status });
    }, [updateFilters]);

    // Funciones de utilidad
    const refreshReportes = useCallback(() => {
        return refetchReportes();
    }, [refetchReportes]);

    // Funciones de cache manual
    const invalidateAll = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: reportesKeys.all });
    }, [queryClient]);

    const invalidateLists = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: reportesKeys.lists() });
    }, [queryClient]);
    
    // Objeto de retorno del hook
    return {
        // Estados
        reportes,
        loading,
        error,
        filters,
        statistics,
        isGenerating: generateMutation.isPending,
        isOperating: generateMutation.isPending,

        // Funciones
        generateReport,
        updateFilters,
        resetFilters,
        searchReportes,
        filterByCategory,
        filterByStatus,
        refreshReportes,
        
        // Funciones de cache
        invalidateCache: invalidateAll,
        invalidateLists,
        
        // Propiedades derivadas
        hasReportes: reportes.length > 0,
        isCached: true,
    };
};

export default useReportes;
