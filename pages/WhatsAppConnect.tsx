import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { evolution } from '../lib/evolution';
import { useAuth } from '../context/AuthContext';

const WhatsAppConnect: React.FC = () => {
  const { user } = useAuth();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'connecting' | 'connected' | 'expired' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timer, setTimer] = useState(40);
  const [instanceName, setInstanceName] = useState<string | null>(null);
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean | null>(null);

  const syncInstance = useCallback(async (name: string, instanceStatus: string = 'connecting') => {
    try {
      if (!user) return;

      await supabase
        .from('whatsapp_instances')
        .upsert({
          user_id: user.id,
          instance_name: name,
          status: instanceStatus,
          updated_at: new Date().toISOString()
        }, { onConflict: 'instance_name' });
    } catch (err) {
      console.warn('Error syncing instance to DB:', err);
    }
  }, [user]);

  const checkCalendarConnection = useCallback(async () => {
    if (!user) return false;
    try {
      const instanceName = `cal_${user.id.substring(0, 8)}`;
      const { data } = await supabase
        .from('calendar_sync')
        .select('access_token')
        .eq('user_id', user.id)
        .eq('instance_name', instanceName)
        .maybeSingle();

      const connected = !!data?.access_token;
      setIsCalendarConnected(connected);
      return connected;
    } catch (err) {
      console.error('Error checking calendar connection:', err);
      setIsCalendarConnected(false);
      return false;
    }
  }, [user]);

  const fetchQRCode = useCallback(async (name: string) => {
    try {
      setStatus('loading');
      setErrorMsg(null);

      console.log('Creating/Updating instance:', name);
      const createRes = await evolution.createInstance(name);
      console.log('Create response:', createRes);

      if (!createRes._debug?.ok) {
        // Se retornar 403, significa que a instância já existe (provavelmente), então seguimos.
        // Se for outro erro, lançamos exceção.
        if (createRes._debug?.status === 403) {
          console.warn('Instance creation returned 403 (likely exists), proceeding to connect...');
        } else {
          throw new Error(`Falha ao configurar instância. Detalhes: ${JSON.stringify(createRes._debug || createRes, null, 2)}`);
        }
      }

      // Sync to our DB for n8n
      await syncInstance(name, 'connecting');

      console.log('Fetching QR for:', name);
      const data = await evolution.connectInstance(name);
      console.log('Connect response:', data);

      // Try multiple property names for the QR code
      const qrValue = data.base64 || data.qrcode?.base64 || (data.code?.startsWith('data:image') ? data.code : null);

      if (qrValue) {
        setQrCode(qrValue);
        setStatus('connecting');
        setTimer(40);
      } else if (data.instance?.state === 'open' || data.state === 'open') {
        setStatus('connected');
        await syncInstance(name, 'connected');
        // Configurar Webhook se já estiver conectado
        try {
          await evolution.setWebhook(
            name,
            'https://teste777.app.n8n.cloud/webhook-test/evolution-webhook',
            ['MESSAGES_UPSERT'],
            true
          );
        } catch (err) {
          console.error('Failed to configure webhook on fetch:', err);
        }
      } else {
        const debugInfo = {
          apiResponse: data,
          _debug: data._debug
        };
        throw new Error(`QR Code não encontrado. Detalhes: ${JSON.stringify(debugInfo, null, 2)}`);
      }
    } catch (err: any) {
      console.error('Error fetching QR:', err);
      setErrorMsg(err.message || 'Erro ao conectar.');
      setStatus('error');
    }
  }, [syncInstance]);

  useEffect(() => {
    async function init() {
      if (user) {
        const hasCalendar = await checkCalendarConnection();
        const name = `wa_${user.id.substring(0, 8)}`;
        setInstanceName(name);

        try {
          const state = await evolution.getInstanceStatus(name);
          console.log('WhatsApp connection status check:', state);

          // Evolution API can return state in state.state or state.instance.state
          const currentState = state?.instance?.state || state?.state || 'unknown';
          console.log('Normalized state:', currentState);

          const isConnected = currentState === 'open';
          const isConnecting = currentState === 'connecting' || currentState === 'reconnecting';

          if (isConnected) {
            setStatus('connected');
            await syncInstance(name, 'connected');
            // Configurar Webhook no init se já conectado
            try {
              await evolution.setWebhook(
                name,
                'https://teste777.app.n8n.cloud/webhook-test/evolution-webhook',
                ['MESSAGES_UPSERT'],
                true
              );
            } catch (err) {
              console.error('Failed to configure webhook on init:', err);
            }
          } else {
            // Se não estiver conectado (mesmo que esteja 'connecting'), buscamos o QR code
            console.log('WhatsApp is not fully connected, fetching QR code...');
            if (hasCalendar) {
              fetchQRCode(name);
            }
          }
        } catch (e) {
          console.error('Error checking status, falling back to QR:', e);
          if (hasCalendar) {
            fetchQRCode(name);
          }
        }
      }
    }
    init();
  }, [user, fetchQRCode, syncInstance, checkCalendarConnection]);

  useEffect(() => {
    let interval: any;
    if (status === 'connecting' && timer > 0) {
      interval = setInterval(async () => {
        setTimer((t) => t - 1);

        if (timer % 5 === 0 && instanceName) {
          try {
            const state = await evolution.getInstanceStatus(instanceName);
            if (state.instance?.state === 'open' || state.state === 'open') {
              setStatus('connected');

              // Configurar Webhook automaticamente
              try {
                console.log('Configuring webhook for:', instanceName);
                await evolution.setWebhook(
                  instanceName,
                  'https://teste777.app.n8n.cloud/webhook-test/evolution-webhook',
                  ['MESSAGES_UPSERT'],
                  true
                );
                console.log('Webhook configured successfully');
              } catch (webhookErr) {
                console.error('Failed to configure webhook:', webhookErr);
              }

              clearInterval(interval);
            }
          } catch (e) {
            console.warn('Polling error:', e);
          }
        }
      }, 1000);
    } else if (timer === 0 && status === 'connecting') {
      setStatus('expired');
    }
    return () => clearInterval(interval);
  }, [status, timer, instanceName]);

  const handleReload = () => {
    if (instanceName) fetchQRCode(instanceName);
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-6xl">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <span className="hover:text-primary cursor-pointer text-slate-400">Configurações</span>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="hover:text-primary cursor-pointer text-slate-400">Integrações</span>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-medium">Conexão WhatsApp</span>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-slate-700 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
          <div className="w-full lg:w-5/12 p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-700/50 relative overflow-hidden bg-white dark:bg-[#162e2e]">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            <div>
              <div className="mb-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Guia de Configuração
                </div>
                <h1 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">Conectar WhatsApp</h1>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Conecte sua conta empresarial para começar a automatizar confirmações e lembretes de agendamento instantaneamente.
                </p>
              </div>

              <div className="space-y-6 relative z-10">
                <StepItem icon="smartphone" title="Abra o WhatsApp" desc="Abra o WhatsApp no seu celular principal." />
                <StepItem
                  icon="more_vert"
                  title="Acesse Configurações"
                  desc={<>Toque em <strong className="text-slate-700 dark:text-slate-300">Menu</strong> (Android) ou <strong className="text-slate-700 dark:text-slate-300">Configurações</strong> (iOS) e selecione <strong className="text-slate-700 dark:text-slate-300">Aparelhos Conectados</strong>.</>}
                />
                <StepItem
                  icon="qr_code_scanner"
                  title="Escaneie o Código"
                  desc={<>Toque em <strong className="text-slate-700 dark:text-slate-300">Conectar um Aparelho</strong> e aponte seu celular para a tela.</>}
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex items-center gap-2 text-xs text-slate-400 relative z-10">
              <span className="material-symbols-outlined text-sm text-emerald-500">lock</span>
              <span>Conexão segura e privada via Evolution API</span>
            </div>
          </div>

          <div className="w-full lg:w-7/12 bg-slate-50 dark:bg-[#132626] flex flex-col items-center justify-center p-8 lg:p-12 relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#13ecec 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <div className="relative w-full max-w-sm mx-auto">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-white dark:bg-surface-dark px-4 py-1.5 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2 whitespace-nowrap">
                  <div className="relative flex h-2.5 w-2.5">
                    <span className={`absolute inline - flex h - full w - full rounded - full ${status === 'connected' ? 'bg-green-500' : 'bg-primary'} opacity - 75 ${(status === 'connecting' || status === 'loading') && 'animate-ping'} `}></span>
                    <span className={`relative inline - flex rounded - full h - 2.5 w - 2.5 ${status === 'error' || status === 'expired' ? 'bg-red-500' : status === 'connected' ? 'bg-green-500' : 'bg-primary'} `}></span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide uppercase">
                    {status === 'connected' ? 'Conectado' : status === 'error' ? 'Erro' : status === 'expired' ? 'Expirado' : status === 'loading' ? 'Iniciando...' : 'Escaneie o código'}
                  </span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-2xl shadow-xl border-4 border-white dark:border-slate-700 relative overflow-hidden group">
                <div className="aspect-square bg-white rounded-xl overflow-hidden relative flex items-center justify-center">
                  {isCalendarConnected === false ? (
                    <div className="flex flex-col items-center gap-6 p-8 text-center animate-fade-in">
                      <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-amber-500 text-4xl">calendar_today</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2">Agenda Necessária</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Para uma sincronização perfeita, você precisa conectar sua Google Agenda antes do WhatsApp.
                        </p>
                      </div>
                      <a
                        href="#/appointments"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">link</span>
                        Conectar Agenda Agora
                      </a>
                    </div>
                  ) : status === 'connected' ? (
                    <div className="flex flex-col items-center gap-4 animate-scale-up">
                      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-600 text-5xl">check_circle</span>
                      </div>
                      <p className="font-bold text-slate-800">Conectado!</p>
                      <p className="text-sm text-slate-500 text-center px-4">Sua automação já está ativa.</p>
                    </div>
                  ) : (
                    <>
                      {status === 'loading' && (
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm font-semibold text-slate-500">Configurando Instância...</p>
                        </div>
                      )}

                      {status === 'error' && (
                        <div className="flex flex-col items-center gap-4 p-6 text-center">
                          <span className="material-symbols-outlined text-red-500 text-5xl">error</span>
                          <p className="font-bold text-slate-800">Falha na conexão</p>
                          <p className="text-xs text-slate-500">{errorMsg}</p>
                          <button onClick={handleReload} className="mt-2 text-primary font-bold text-sm underline">Tentar novamente</button>
                        </div>
                      )}

                      {(status === 'connecting' || status === 'expired') && qrCode && (
                        <img
                          alt="WhatsApp Connection QR Code"
                          className={`w - full h - full object - contain p - 4 transition - opacity duration - 300 ${status === 'expired' ? 'opacity-20 blur-sm' : 'opacity-100'} `}
                          src={qrCode}
                        />
                      )}

                      {status === 'connecting' && <div className="scan-line z-10 pointer-events-none"></div>}

                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg z-10"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg z-10"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg z-10"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg z-10"></div>

                      {status === 'expired' && (
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-20"
                          onClick={handleReload}
                        >
                          <span className="material-symbols-outlined text-4xl text-primary mb-2 animate-bounce">refresh</span>
                          <span className="font-bold text-slate-800">Recarregar QR</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {status !== 'connected' && status !== 'error' && status !== 'loading' && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    O código expira em <span className={`tabular - nums ${status === 'expired' ? 'text-red-500' : 'text-slate-900 dark:text-primary'} `}>{timer}s</span>
                  </p>
                  <div className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear" style={{ width: `${(timer / 40) * 100}% ` }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center px-4">
          <p className="text-xs text-slate-400 dark:text-slate-600 max-w-2xl mx-auto">
            Esta conexão é segura e segue todos os protocolos oficiais.
            Sua privacidade é nossa prioridade.
          </p>
        </div>
      </div>
    </div>
  );
};

const StepItem: React.FC<{ icon: string; title: string; desc: React.ReactNode }> = ({ icon, title, desc }) => (
  <div className="flex gap-4 group">
    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary transition-all duration-300">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div>
      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
    </div>
  </div>
);

export default WhatsAppConnect;