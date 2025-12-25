// API service
const API_URL = 'https://marko-assess-1.onrender.com/api';

const api = {
    createSignal: async (rawText) => {
        const res = await fetch(`${API_URL}/signals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawText })
        });
        if (!res.ok) throw new Error('Failed to create signal');
        return res.json();
    },

    getSignals: async (params = {}) => {
        const query = new URLSearchParams(params);
        const res = await fetch(`${API_URL}/signals?${query}`);
        if (!res.ok) throw new Error('Failed to fetch signals');
        return res.json();
    },

    getSummary: async (days = 30) => {
        const res = await fetch(`${API_URL}/analytics/summary?days=${days}`);
        if (!res.ok) throw new Error('Failed to fetch analytics');
        return res.json();
    }
};

export default api;