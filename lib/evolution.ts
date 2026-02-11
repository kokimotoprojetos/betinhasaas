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
                token: instanceName, // Using name as token for simplicity in this flow
                qrcode: true
            })
        });
        return response.json();
    },

    async connectInstance(instanceName: string) {
        const response = await fetch(`${API_URL}/instance/connect/${instanceName}`, {
            headers: { 'apikey': API_KEY }
        });
        return response.json(); // Usually returns base64 QR
    },

    async getInstanceStatus(instanceName: string) {
        const response = await fetch(`${API_URL}/instance/connectionState/${instanceName}`, {
            headers: { 'apikey': API_KEY }
        });
        return response.json();
    },

    async logoutInstance(instanceName: string) {
        const response = await fetch(`${API_URL}/instance/logout/${instanceName}`, {
            method: 'DELETE',
            headers: { 'apikey': API_KEY }
        });
        return response.json();
    }
};
