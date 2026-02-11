const API_URL = import.meta.env.VITE_EVOLUTION_API_URL?.replace(/\/$/, '');
const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY;

const validateConfig = () => {
    if (!API_URL || API_URL === 'undefined' || API_URL === '') {
        throw new Error('Configuração ausente: VITE_EVOLUTION_API_URL não foi encontrado nas variáveis de ambiente.');
    }
    if (!API_KEY || API_KEY === 'undefined' || API_KEY === '') {
        throw new Error('Configuração ausente: VITE_EVOLUTION_API_KEY não foi encontrado nas variáveis de ambiente.');
    }

    // Masked logging for debugging (only in development or if explicitly needed)
    console.log('API Config Check:', {
        url: API_URL,
        keyLength: API_KEY?.length,
        keyStart: API_KEY?.substring(0, 3) + '...',
        keyEnd: '...' + API_KEY?.substring(API_KEY.length - 3)
    });
};

export interface EvolutionInstance {
    instanceName: string;
    owner?: string;
    profileName?: string;
    status: 'open' | 'close' | 'connecting';
}

const handleResponse = async (response: Response) => {
    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : { success: response.ok };
    } catch (e) {
        data = { error: 'Dados inválidos recebidos da API (Não é um JSON)', text };
    }

    // Always return an object with debug info
    // We add more info if it's a 401 to help the user verify their key
    const debug: any = {
        status: response.status,
        url: response.url,
        ok: response.ok
    };

    if (response.status === 401) {
        debug.keyCheck = {
            length: API_KEY?.length || 0,
            start: API_KEY?.substring(0, 3) + '...',
            end: '...' + API_KEY?.substring(Math.max(0, (API_KEY?.length || 0) - 3))
        };
    }

    return {
        ...(typeof data === 'object' && data !== null ? data : { data }),
        _debug: debug
    };
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
