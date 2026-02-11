const API_URL = import.meta.env.VITE_EVOLUTION_API_URL?.replace(/\/$/, '');
const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

// Validation at load time
if (!API_URL || API_URL.includes('undefined')) {
    console.error('❌ VITE_EVOLUTION_API_URL não está definido ou está incorreto no arquivo .env');
}
if (!API_KEY) {
    console.error('❌ VITE_EVOLUTION_API_KEY não está definido no arquivo .env');
}

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
        return {
            success: response.ok,
            error: 'Dados inválidos recebidos da API (Não é um JSON)',
            status: response.status,
            url: response.url,
            text: text // For debugging
        };
    }
};

const getHeaders = () => ({
    'apikey': API_KEY,
    'Accept': 'application/json'
});

export const evolution = {
    async getInstances() {
        const response = await fetch(`${API_URL}/instance/fetchInstances`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    async createInstance(instanceName: string) {
        const response = await fetch(`${API_URL}/instance/create`, {
            method: 'POST',
            headers: {
                ...getHeaders(),
                'Content-Type': 'application/json'
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
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    async getInstanceStatus(instanceName: string) {
        try {
            const response = await fetch(`${API_URL}/instance/connectionState/${instanceName}`, {
                headers: getHeaders()
            });
            return handleResponse(response);
        } catch {
            return { instance: { state: 'disconnected' } };
        }
    },

    async logoutInstance(instanceName: string) {
        const response = await fetch(`${API_URL}/instance/logout/${instanceName}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(response);
    }
};
