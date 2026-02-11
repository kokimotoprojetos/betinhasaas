const API_URL = import.meta.env.VITE_EVOLUTION_API_URL?.replace(/\/$/, '');
const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

const validateConfig = () => {
    if (!API_URL || API_URL === 'undefined' || API_URL === '') {
        throw new Error('Configuração ausente: VITE_EVOLUTION_API_URL não foi encontrado nas variáveis de ambiente.');
    }
    if (!API_KEY || API_KEY === 'undefined' || API_KEY === '') {
        throw new Error('Configuração ausente: VITE_EVOLUTION_API_KEY não foi encontrado nas variáveis de ambiente.');
    }
};

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
        validateConfig();
        const response = await fetch(`${API_URL}/instance/fetchInstances`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    async createInstance(instanceName: string) {
        validateConfig();
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
        validateConfig();
        const response = await fetch(`${API_URL}/instance/connect/${instanceName}`, {
            headers: getHeaders()
        });
        return handleResponse(response);
    },

    async getInstanceStatus(instanceName: string) {
        try {
            validateConfig();
            const response = await fetch(`${API_URL}/instance/connectionState/${instanceName}`, {
                headers: getHeaders()
            });
            return handleResponse(response);
        } catch (err: any) {
            return { instance: { state: 'disconnected' }, error: err.message };
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
