import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const ragService = {
  async sendMessage(message) {
    const token = useAuthStore.getState().token;
    const res = await fetch(`${BASE_URL}/rag/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Error ${res.status}`);
    }
    const data = await res.json();
    return data.response;
  },

  async resetConversation() {
    const token = useAuthStore.getState().token;
    const res = await fetch(`${BASE_URL}/rag/conversation`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
  },

  isConfigured() {
    return !!useAuthStore.getState().token;
  },
};

export default ragService;
