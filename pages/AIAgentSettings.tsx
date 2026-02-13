import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface AgentConfig {
    salon_name: string;
    email: string;
    whatsapp: string;
    prices: string;
    schedules: string;
    location: string;
    description: string;
    instance_name?: string;
}

const AIAgentSettings: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [config, setConfig] = useState<AgentConfig>({
        salon_name: '',
        email: '',
        whatsapp: '',
        prices: '',
        schedules: '',
        location: '',
        description: '',
        instance_name: ''
    });

    const fetchConfig = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);

            // Fetch in parallel - handle multiple results by taking the most recent
            const [instanceRes, configRes] = await Promise.all([
                supabase
                    .from('whatsapp_instances')
                    .select('instance_name')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle(),
                supabase
                    .from('ai_agent_configs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle()
            ]);

            const currentInstanceName = instanceRes.data?.instance_name;
            const data = configRes.data;

            if (data) {
                setConfig({
                    salon_name: data.salon_name || '',
                    email: data.email || '',
                    whatsapp: data.whatsapp || '',
                    prices: typeof data.prices === 'string' ? data.prices : JSON.stringify(data.prices, null, 2),
                    schedules: typeof data.schedules === 'string' ? data.schedules : JSON.stringify(data.schedules, null, 2),
                    location: data.location || '',
                    description: data.description || '',
                    instance_name: data.instance_name || currentInstanceName || ''
                });
            } else if (currentInstanceName) {
                setConfig(prev => ({ ...prev, instance_name: currentInstanceName }));
            }
        } catch (err: any) {
            console.error('Error fetching config:', err);
            setMessage({ type: 'error', text: 'Erro ao carregar configurações: ' + (err.message || 'Erro desconhecido') });
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 6000);

        fetchConfig().finally(() => clearTimeout(timeout));

        return () => clearTimeout(timeout);
    }, [fetchConfig]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;
        try {
            setSaving(true);
            setMessage(null);

            // Ensure we have the latest instance name if not set
            let targetInstanceName = config.instance_name;
            if (!targetInstanceName) {
                const { data: instanceData, error: instanceError } = await supabase
                    .from('whatsapp_instances')
                    .select('instance_name')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (instanceError) {
                    console.error('Error fetching instance for save:', instanceError);
                    throw new Error('Falha ao identificar sua conexão. Por favor, conecte o WhatsApp primeiro.');
                }

                targetInstanceName = instanceData?.instance_name || `wa_${user.id.substring(0, 8)}`;
            }


            // Try to parse JSON fields if they look like JSON, otherwise save as string
            const parseField = (val: string) => {
                try {
                    return JSON.parse(val);
                } catch {
                    return val;
                }
            };

            const payload = {
                user_id: user.id,
                salon_name: config.salon_name,
                email: config.email,
                whatsapp: config.whatsapp,
                prices: parseField(config.prices),
                schedules: parseField(config.schedules),
                location: config.location,
                description: config.description,
                instance_name: targetInstanceName, // Connect config to specific instance
                updated_at: new Date().toISOString()
            };

            const { error: saveError } = await supabase
                .from('ai_agent_configs')
                .upsert(payload);

            if (saveError) {
                console.error('Database save error:', saveError);
                throw saveError;
            }

            // Also suggest keeping local state in sync
            setConfig(prev => ({ ...prev, instance_name: targetInstanceName || prev.instance_name }));

            setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
        } catch (err: any) {
            console.error('Error saving config:', err);
            setMessage({
                type: 'error',
                text: 'Erro ao salvar: ' + (err.message || 'Verifique sua conexão e tente novamente.')
            });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex-grow p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Configurações do Agente de IA</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Defina o conhecimento que seu agente de IA usará para interagir com seus clientes.
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nome do Salão / Barbearia</label>
                                <input
                                    type="text"
                                    value={config.salon_name}
                                    onChange={(e) => setConfig({ ...config, salon_name: e.target.value })}
                                    placeholder="Ex: Barber Shop Triumfuz"
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email de Contato</label>
                                    <input
                                        type="email"
                                        value={config.email}
                                        onChange={(e) => setConfig({ ...config, email: e.target.value })}
                                        placeholder="exemplo@salao.com"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">WhatsApp de Suporte</label>
                                    <input
                                        type="text"
                                        value={config.whatsapp}
                                        onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                                        placeholder="(11) 99999-9999"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Localização</label>
                            <input
                                type="text"
                                value={config.location}
                                onChange={(e) => setConfig({ ...config, location: e.target.value })}
                                placeholder="Rua Exemplo, 123 - Centro"
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Descrição do Salão/Barbearia</label>
                            <textarea
                                value={config.description}
                                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                                placeholder="Descreva seu salão, especialidades e diferenciais..."
                                rows={4}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tabela de Preços</label>
                                    <span className="text-[10px] text-slate-400">Texto ou JSON</span>
                                </div>
                                <textarea
                                    value={config.prices}
                                    onChange={(e) => setConfig({ ...config, prices: e.target.value })}
                                    placeholder="Corte Masculino: R$ 50&#10;Barba: R$ 30"
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Horários de Funcionamento</label>
                                    <span className="text-[10px] text-slate-400">Texto ou JSON</span>
                                </div>
                                <textarea
                                    value={config.schedules}
                                    onChange={(e) => setConfig({ ...config, schedules: e.target.value })}
                                    placeholder="Segunda a Sexta: 09h às 19h&#10;Sábado: 08h às 20h"
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        {message && (
                            <div className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {message.text}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className="ml-auto px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-xl">save</span>
                                    Salvar Configurações
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AIAgentSettings;
