const API_URL = import.meta.env.VITE_EVOLUTION_API_URL;
const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

export interface EvolutionInstance {
    instanceName: string;
    owner?: string;
    profileName?: string;
    status: 'open' | 'close' | 'connecting';
}

export const evolution = {
    async getInstances() {
        const response = await fetch(`${API_URL}/instance/fetchInstances`, {
            headers: { 'apikey': API_KEY }
        });
        if (!response.ok) throw new Error('Failed to fetch instances');
        return response.json();
    },

    async createInstance(instanceName: string) {
        const response = await fetch(`${API_URL}/instance/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            },
            body: JSON.stringify({
                instanceName,
                token: instanceName,
                qrcode: true,
                integration: 'WHATSAPP-BAILEYS'
            })
        });
        // If instance already exists, it might return 403 or success message
        const data = await response.json();
        return data;
    },

    async connectInstance(instanceName: string) {
        const response = await fetch(`${API_URL}/instance/connect/${instanceName}`, {
            headers: { 'apikey': API_KEY }
        });
        if (!response.ok) throw new Error('Failed to connect instance');
        return response.json(); // Usually returns base64 QR
    },

    async getInstanceStatus(instanceName: string) {
        try {
            const response = await fetch(`${API_URL}/instance/connectionState/${instanceName}`, {
                headers: { 'apikey': API_KEY }
            });
            if (!response.ok) return { instance: { state: 'disconnected' } };
            return response.json();
        } catch {
            return { instance: { state: 'disconnected' } };
        }
    },

    async logoutInstance(instanceName: string) {
        const response = await fetch(`${API_URL}/instance/logout/${instanceName}`, {
            method: 'DELETE',
            headers: { 'apikey': API_KEY }
        });
        return response.json();
    }
};
