import React, { useState, useEffect, useMemo } from 'react';
import MetricCard from '../components/MetricCard';
import { Metric, Conversation, Appointment } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [aiActive, setAiActive] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // Wait for user from context

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    async function getInitialData() {
      try {
        const [convs, apts] = await Promise.all([
          supabase.from('conversations').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('appointments').select('*').order('time', { ascending: true })
        ]);

        if (convs.data) setConversations(convs.data as any);
        if (apts.data) setAppointments(apts.data as any);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
        clearTimeout(timeout);
      }
    }
    getInitialData();

    return () => clearTimeout(timeout);
  }, [user]);

  const metrics: Metric[] = useMemo(() => [
    { label: 'Total Appointments', value: appointments.length.toString(), trend: '+0%', trendUp: true, subtext: 'this week', icon: 'calendar_today' },
    { label: 'AI Response Rate', value: '0%', trend: '-', trendUp: false, progress: 0, icon: 'smart_toy' },
    { label: 'Customer Satisfaction', value: 'N/A', icon: 'sentiment_satisfied' },
    { label: 'Peak AI Activity', value: '-', subtext: 'N/A', icon: 'schedule' },
  ], [appointments.length]);


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {getGreeting()}, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Profissional'}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1">Aqui está a visão geral do seu atendimento.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white dark:bg-[#152e2e] px-4 py-2 rounded-full shadow-sm border border-green-100 dark:border-green-900/30">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${!aiActive && 'hidden'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${aiActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </span>
            <span className={`text-sm font-medium ${aiActive ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}>
              {aiActive ? 'WhatsApp Conectado' : 'IA Pausada'}
            </span>
          </div>
          <button
            onClick={() => setAiActive(!aiActive)}
            className={`font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm ${aiActive
              ? 'bg-primary hover:bg-primary-dark text-white dark:text-background-dark shadow-primary/20'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
          >
            <span className="material-symbols-outlined text-[1.25rem]">{aiActive ? 'pause_circle' : 'play_circle'}</span>
            {aiActive ? 'Pausar IA' : 'Ativar IA'}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <MetricCard key={idx} metric={metric} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* Recent Conversations */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-[#152e2e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">forum</span>
                Conversas Recentes
              </h2>
              <button className="text-sm text-primary font-semibold hover:text-primary-dark dark:hover:text-primary/80">Ver Tudo</button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {conversations.length > 0 ? conversations.map((chat) => (
                <div key={chat.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {chat.avatar ? (
                        <img alt={chat.name} className="w-10 h-10 rounded-full object-cover" src={chat.avatar} />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${chat.initialsColor === 'orange' ? 'bg-orange-100 text-orange-600' :
                          chat.initialsColor === 'purple' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {chat.initials || chat.name.charAt(0)}
                        </div>
                      )}
                      {chat.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{chat.name}</h4>
                        <span className="text-xs text-slate-400">{chat.time}</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-gray-400 truncate">{chat.message}</p>
                      <div className="mt-2 flex gap-2">
                        <StatusBadge status={chat.status} />
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-slate-300 text-3xl">chat_bubble_outline</span>
                  </div>
                  <p className="text-slate-500 dark:text-gray-400">Nenhuma conversa ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Right */}
        <div className="flex flex-col gap-6">
          {/* Performance Card */}
          <div className="bg-white dark:bg-[#152e2e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative group h-48">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-transparent"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <h3 className="text-slate-900 dark:text-white font-bold text-lg leading-tight">Saúde da sua IA</h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Conecte seu WhatsApp para começar a capturar leads.</p>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-[#152e2e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex-1">
            <div className="p-6 border-b border-gray-50 dark:border-gray-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Próximos Agendamentos</h2>
            </div>
            <div className="p-4 space-y-3">
              {appointments.length > 0 ? appointments.map((apt) => (
                <div key={apt.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${apt.isToday
                  ? 'bg-lavender-light dark:bg-primary/5 border-transparent hover:border-primary/20'
                  : 'bg-white dark:bg-transparent border-gray-100 dark:border-gray-700 opacity-75'
                  }`}>
                  <div className="text-center min-w-[3rem]">
                    <div className={`text-xs font-bold uppercase ${apt.isToday ? 'text-primary' : 'text-slate-400'}`}>{apt.dayLabel}</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{apt.time}</div>
                  </div>
                  <div className="h-8 w-px bg-slate-200 dark:bg-gray-700"></div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white text-sm">{apt.name}</p>
                    <p className="text-xs text-slate-500">{apt.service}</p>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center">
                  <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">calendar_today</span>
                  <p className="text-sm text-slate-500">Sem agendamentos hoje.</p>
                </div>
              )}
            </div>
            <div className="px-6 pb-6 pt-2">
              <button className="w-full py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                Ver Calendário
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let classes = "";
  let icon = "";

  switch (status) {
    case 'AI Handling':
      classes = "bg-primary/10 text-primary-dark dark:text-primary";
      icon = "smart_toy";
      break;
    case 'Booked':
      classes = "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      icon = "check_circle";
      break;
    case 'Human Intervention Needed':
      classes = "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
      icon = "person";
      break;
    case 'AI Resolved':
      classes = "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
      icon = "done_all";
      break;
    default:
      classes = "bg-slate-100 text-slate-600";
      icon = "more_horiz";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${classes}`}>
      <span className={`material-symbols-outlined text-[12px] ${status === 'AI Handling' ? 'animate-pulse' : ''}`}>{icon}</span> {status}
    </span>
  );
};

export default Dashboard;