import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { googleCalendar } from '../lib/googleCalendar';
import { useAuth } from '../context/AuthContext';

const Appointments: React.FC = () => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async (userId: string) => {
        try {
            const data = await googleCalendar.getEvents(userId);
            setEvents(data.items || []);
        } catch (err: any) {
            console.error('Error fetching events:', err);
            if (err.message.includes('Unauthorized')) {
                setIsConnected(false);
            }
        }
    }, []);

    const checkConnection = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const instanceName = `cal_${user.id.substring(0, 8)}`;

            const { data: existingConfig } = await supabase
                .from('calendar_sync')
                .select('*')
                .eq('user_id', user.id)
                .eq('instance_name', instanceName)
                .maybeSingle();

            if (existingConfig && existingConfig.access_token) {
                setIsConnected(true);
                await fetchEvents(user.id);
            } else {
                setIsConnected(false);
            }
        } catch (err) {
            console.error('Erro fatal no checkConnection:', err);
        } finally {
            setLoading(false);
        }
    }, [user, fetchEvents]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 6000);

        checkConnection().finally(() => clearTimeout(timeout));

        return () => clearTimeout(timeout);
    }, [checkConnection]);



    const handleConnect = async () => {
        try {
            const { data, error } = await supabase.auth.linkIdentity({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                    scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) throw error;
        } catch (err: any) {
            console.error('Error connecting to Google:', err);
            // Fallback: If linkIdentity fails (e.g. not supported in some versions or specific errors), try standard sign in but warn user
            if (err.message && err.message.includes('already linked')) {
                alert('Esta conta do Google já está vinculada. Tentando atualizar credenciais...');
                // Force re-auth to refresh tokens if needed, but carefully
                await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin,
                        scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
                        queryParams: {
                            access_type: 'offline',
                            prompt: 'consent',
                        }
                    }
                });
            } else {
                alert('Erro ao conectar com Google: ' + err.message);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex-grow p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Agenda de Atendimentos</h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Sincronize com o Google Agenda para gerenciar seus horários em tempo real.
                        </p>
                    </div>
                    {!isConnected ? (
                        <button
                            onClick={handleConnect}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group"
                        >
                            <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" alt="Google Calendar" className="w-6 h-6" />
                            <span className="font-semibold text-slate-700 dark:text-slate-200">Conectar Google Agenda</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Agenda Sincronizada</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Calendar View (Placeholder) */}
                    <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 min-h-[500px] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">calendar_month</span>
                                Visão Semanal
                            </h2>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <span className="text-sm font-semibold">Fevereiro 2026</span>
                                <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>

                        {!isConnected ? (
                            <div className="flex-grow flex flex-col items-center justify-center text-center p-12 space-y-4">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-300 text-4xl">event_busy</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Agenda Desconectada</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                                    Conecte sua conta do Google para visualizar seus agendamentos e permitir que a IA marque novos horários.
                                </p>
                                <button onClick={handleConnect} className="text-primary font-bold hover:underline">Configurar Agora</button>
                            </div>
                        ) : (
                            <div className="flex-grow overflow-y-auto">
                                {events.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400">
                                        <span className="material-symbols-outlined text-4xl mb-2">calendar_today</span>
                                        <p>Nenhum compromisso encontrado para os próximos dias.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 p-2">
                                        {events.map((event) => (
                                            <div key={event.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group hover:border-primary/30 transition-all">
                                                <div className="text-center min-w-[3rem]">
                                                    <div className="text-[10px] font-bold uppercase text-primary">
                                                        {new Date(event.start.dateTime || event.start.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                                                    </div>
                                                    <div className="text-xl font-bold text-slate-800 dark:text-white">
                                                        {new Date(event.start.dateTime || event.start.date).getDate()}
                                                    </div>
                                                </div>
                                                <div className="h-10 w-px bg-slate-200 dark:bg-slate-800"></div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-800 dark:text-white truncate">{event.summary || '(Sem título)'}</h4>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                        {new Date(event.start.dateTime || event.start.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                {event.status === 'confirmed' && (
                                                    <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Side Info */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Configurações da Agenda</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">auto_schedule</span>
                                        <div className="text-sm">
                                            <p className="font-bold">Agendamento Automático</p>
                                            <p className="text-xs text-slate-500">Permitir que a IA insira eventos</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">notifications_active</span>
                                        <div className="text-sm">
                                            <p className="font-bold">Notificações</p>
                                            <p className="text-xs text-slate-500">Avisar sobre novos horários</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border border-primary/10">
                            <div className="flex items-center gap-2 text-primary mb-2">
                                <span className="material-symbols-outlined">info</span>
                                <h4 className="font-bold text-sm uppercase tracking-wider">Como funciona?</h4>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Ao conectar sua agenda, o agente BeautyConnect AI consultará seus horários livres antes de oferecer opções aos clientes via WhatsApp. Novos agendamentos aparecerão instantaneamente aqui e no seu celular.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Appointments;
