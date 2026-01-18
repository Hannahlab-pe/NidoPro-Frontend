import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useNotifications = (userId) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await axios.get(`/api/v1/notificacion/usuario/${userId}`);
      return response.data;
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useUnreadNotifications = (userId) => {
  return useQuery({
    queryKey: ['unreadNotifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await axios.get(`/api/v1/notificacion/usuario/${userId}/no-leidas`);
      return response.data;
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
