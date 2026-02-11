const API_URL = import.meta.env.VITE_EVOLUTION_API_URL;
const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

export interface EvolutionInstance {
    instanceName: string;
    owner?: string;
    profileName?: string;
    status: 'open' | 'close' | 'connecting';
}

const handleResponse = async (response: Response) => {
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : { success: response.ok };
    } catch (e) {
        return { success: response.ok, error: 'Invalid JSON', text };
    }
};

export const evolution = {
    async getInstances() {
        const response = await fetch(`${API_URL}/instance/fetchInstances`, {
            headers: { 'apikey': API_KEY }
        });
        return handleResponse(response);
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
        return handleResponse(response);
    },

    async connectInstance(instanceName: string) {
        const response = await fetch(`${API_URL}/instance/connect/${instanceName}`, {
            headers: { 'apikey': API_KEY }
        });
        return handleResponse(response);
    },

    async getInstanceStatus(instanceName: string) {
        try {
            const response = await fetch(`${API_URL}/instance/connectionState/${instanceName}`, {
                headers: { 'apikey': API_KEY }
            });
            return handleResponse(response);
        } catch {
            return { instance: { state: 'disconnected' } };
        }
    },

    async logoutInstance(instanceName: string) {
        const response = await fetch(`${API_URL}/instance/logout/${instanceName}`, {
            method: 'DELETE',
            headers: { 'apikey': API_KEY }
        });
        return handleResponse(response);
    }
};
