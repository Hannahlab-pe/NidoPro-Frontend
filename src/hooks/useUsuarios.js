// src/hooks/useUsuarios.js
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import usuarioService from '../services/usuarioService'; // Asegúrate de tener este servicio

// Query Keys para usuarios
const usuariosKeys = {
    all: ['usuarios'],
    lists: () => [...usuariosKeys.all, 'list'],
    list: (filters) => [...usuariosKeys.lists(), { filters }],
    details: () => [...usuariosKeys.all, 'detail'],
    detail: (id) => [...usuariosKeys.details(), id],
    statistics: () => [...usuariosKeys.all, 'statistics']
};

/**
 * Hook personalizado para gestionar usuarios con TanStack Query
 * Combina queries, mutations, cache y lógica de negocio en un solo lugar
 */
export const useUsuarios = (initialFilters = {}) => {
    const queryClient = useQueryClient();
    
    // Estado para filtros y búsqueda
    const [filters, setFilters] = useState({
        rol: '',
        estaActivo: '',
        search: '',
        ...initialFilters
    });

    // Query principal para obtener usuarios
    const { 
        data: rawUsuarios, 
        isLoading: loading, 
        error,
        refetch: refetchUsuarios 
    } = useQuery({
        queryKey: usuariosKeys.list(filters),
        queryFn: async () => {
            const response = await usuarioService.getAllUsuarios(filters);
            console.log('Datos recibidos en el hook:', response);
            
            // El servicio ya devuelve el array de datos directamente
            return Array.isArray(response) ? response : [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const usuarios = Array.isArray(rawUsuarios) ? rawUsuarios : [];

    // Mutations con cache automático
    const createMutation = useMutation({
        mutationFn: (usuarioData) => usuarioService.createUsuario(usuarioData),
        onMutate: () => {
            const loadingToast = toast.loading('Creando usuario...', {
                description: 'Por favor espera mientras se crea el usuario.'
            });
            return { loadingToast };
        },
        onSuccess: (newUsuario, variables, context) => {
            queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
            queryClient.invalidateQueries({ queryKey: usuariosKeys.statistics() });
            
            toast.success('Usuario creado exitosamente', {
                id: context.loadingToast,
                description: `El usuario "${newUsuario.nombre || newUsuario.email}" ha sido creado.`
            });
        },
        onError: (error, variables, context) => {
            toast.error('Error al crear usuario', {
                id: context?.loadingToast,
                description: error.message || 'Ha ocurrido un error inesperado'
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => usuarioService.updateUsuario(id, data),
        onMutate: () => {
            const loadingToast = toast.loading('Actualizando usuario...', {
                description: 'Por favor espera mientras se actualiza el usuario.'
            });
            return { loadingToast };
        },
        onSuccess: (updatedUsuario, variables, context) => {
            queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
            queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(variables.id) });
            
            toast.success('Usuario actualizado exitosamente', {
                id: context.loadingToast,
                description: 'Los cambios han sido guardados correctamente.'
            });
        },
        onError: (error, variables, context) => {
            toast.error('Error al actualizar usuario', {
                id: context?.loadingToast,
                description: error.message || 'Ha ocurrido un error inesperado'
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => usuarioService.deleteUsuario(id),
        onMutate: () => {
            const loadingToast = toast.loading('Eliminando usuario...', {
                description: 'Por favor espera mientras se elimina el usuario.'
            });
            return { loadingToast };
        },
        onSuccess: (_, variables, context) => {
            queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
            queryClient.removeQueries({ queryKey: usuariosKeys.detail(variables) });
            
            toast.success('Usuario eliminado exitosamente', {
                id: context.loadingToast,
                description: 'El usuario ha sido eliminado del sistema.'
            });
        },
        onError: (error, variables, context) => {
            toast.error('Error al eliminar usuario', {
                id: context?.loadingToast,
                description: error.message || 'Ha ocurrido un error inesperado'
            });
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ usuario }) => usuarioService.toggleUsuarioStatus(usuario.id, !usuario.estaActivo),
        onMutate: () => {
            const loadingToast = toast.loading('Cambiando estado...', {
                description: 'Por favor espera mientras se actualiza el estado.'
            });
            return { loadingToast };
        },
        onSuccess: (updatedUsuario, variables, context) => {
            queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
            queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(variables.usuario.id) });
            
            const newStatus = updatedUsuario.estaActivo ? 'activado' : 'desactivado';
            toast.success(`Usuario ${newStatus} exitosamente`, {
                id: context.loadingToast,
                description: `El usuario ha sido ${newStatus} correctamente.`
            });
        },
        onError: (error, variables, context) => {
            toast.error('Error al cambiar estado', {
                id: context?.loadingToast,
                description: error.message || 'Ha ocurrido un error inesperado'
            });
        },
    });

    // --- Sección de Estadísticas ---
    const statistics = useMemo(() => {
        if (!usuarios || usuarios.length === 0) {
            return {
                total: 0,
                active: 0,
                inactive: 0,
                byRole: {},
                recentRegistrations: 0,
                lastLogin: null
            };
        }

        const total = usuarios.length;
        const active = usuarios.filter(u => u.estaActivo).length;
        const inactive = total - active;

        // Agrupar por rol
        const byRole = usuarios.reduce((acc, usuario) => {
            const role = usuario.rol?.nombre || usuario.rol || 'Sin rol';
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});

        // Registros recientes (último mes)
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const recentRegistrations = usuarios.filter(u => 
            new Date(u.fechaCreacion || u.createdAt) > oneMonthAgo
        ).length;

        // Último login más reciente
        const lastLogin = usuarios
            .filter(u => u.ultimoLogin)
            .sort((a, b) => new Date(b.ultimoLogin) - new Date(a.ultimoLogin))[0]?.ultimoLogin || null;

        return {
            total,
            active,
            inactive,
            byRole,
            recentRegistrations,
            lastLogin,
        };
    }, [usuarios]);
    // --- Fin de la Sección de Estadísticas ---

    // Funciones CRUD usando mutations
    const createUsuario = useCallback(async (usuarioData) => {
        return createMutation.mutateAsync(usuarioData);
    }, [createMutation]);

    const updateUsuario = useCallback(async (id, usuarioData) => {
        return updateMutation.mutateAsync({ id, data: usuarioData });
    }, [updateMutation]);

    const deleteUsuario = useCallback(async (id) => {
        return deleteMutation.mutateAsync(id);
    }, [deleteMutation]);

    const toggleUsuarioStatus = useCallback(async (usuario) => {
        return toggleStatusMutation.mutateAsync({ usuario });
    }, [toggleStatusMutation]);

    // Funciones de filtrado y búsqueda
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            rol: '',
            estaActivo: '',
            search: ''
        });
    }, []);

    const searchUsuarios = useCallback((searchTerm) => {
        updateFilters({ search: searchTerm });
    }, [updateFilters]);

    const filterByRol = useCallback((rol) => {
        updateFilters({ rol });
    }, [updateFilters]);

    const filterByEstado = useCallback((estaActivo) => {
        updateFilters({ estaActivo });
    }, [updateFilters]);

    // Estados derivados
    const creating = createMutation.isPending;
    const updating = updateMutation.isPending;
    const deleting = deleteMutation.isPending;
    const uploading = false; // Para compatibilidad
    
    // Funciones de utilidad
    const fetchUsuarios = useCallback(async (customFilters = {}) => {
        if (Object.keys(customFilters).length > 0) {
            updateFilters(customFilters);
        } else {
            return refetchUsuarios();
        }
    }, [refetchUsuarios, updateFilters]);

    const refreshUsuarios = useCallback(() => {
        return refetchUsuarios();
    }, [refetchUsuarios]);

    // Funciones de cache manual
    const invalidateAll = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: usuariosKeys.all });
    }, [queryClient]);

    const invalidateLists = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    }, [queryClient]);

    // Objeto de retorno del hook
    return {
        // Estados
        usuarios,
        loading,
        creating,
        updating,
        deleting,
        uploading,
        filters,
        error,
        statistics, // <-- Estadísticas de usuarios

        // Funciones CRUD
        createUsuario,
        updateUsuario,
        deleteUsuario,
        toggleUsuarioStatus,
        
        // Funciones de búsqueda y filtrado
        searchUsuarios,
        filterByRol,
        filterByEstado,
        updateFilters,
        resetFilters,
        
        // Funciones de utilidad
        fetchUsuarios,
        refreshUsuarios,
        
        // Funciones de cache
        invalidateCache: invalidateAll,
        invalidateLists,
        
        // Funciones derivadas
        getActiveUsuarios: () => usuarios.filter(u => u.estaActivo === true),
        getInactiveUsuarios: () => usuarios.filter(u => u.estaActivo === false),
        getUsersByRole: (rol) => usuarios.filter(u => u.rol === rol || u.rol?.nombre === rol),
        getTotalUsuarios: () => usuarios.length,
        
        // Estados computados
        hasUsuarios: usuarios.length > 0,
        isOperating: creating || updating || deleting || uploading,
        isCached: true, // TanStack Query maneja el cache automáticamente
    };
};

export default useUsuarios;
