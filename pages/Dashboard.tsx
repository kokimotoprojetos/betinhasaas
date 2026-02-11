import React, { useState } from 'react';
import MetricCard from '../components/MetricCard';
import { Metric, Conversation, Appointment } from '../types';

const Dashboard: React.FC = () => {
  const [aiActive, setAiActive] = useState(true);

  const metrics: Metric[] = [
    { label: 'Total Appointments', value: '42', trend: '+12%', trendUp: true, subtext: 'this week', icon: 'calendar_today' },
    { label: 'AI Response Rate', value: '95%', trend: 'High', trendUp: false, progress: 95, icon: 'smart_toy' },
    { label: 'Customer Satisfaction', value: '4.8', icon: 'sentiment_satisfied' },
    { label: 'Peak AI Activity', value: '6 PM', subtext: 'Yesterday', icon: 'schedule' },
  ];

  const conversations: Conversation[] = [
    {
      id: '1', name: 'Sarah Jenkins', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJrBjjYtMGDr6f8Muv9JSVTfe3c51sl0clzDzdVclIUOiZrhBWc_QHApwMj6EwJnlvZidQLculb1sIypcW_WeA6eUysaPS5TgGH61_gkiq3DNPkghHnTVOMwQbJlINbg-UsD5VgtF7WFhIKLMGSnEx6u0ssKYC7vBe3VDBLN0eubpdtxfYtH20oJJ-ULcfY1oWqvo6d1TxW7MfpSQg90XS9tL4HYaGOGFHD7NWnaC4eJPWgyhBGt1g5QHJh_C1xoRpmjTVmK9c2q0M',
      time: '2m ago', message: 'Do you have any availability for a balayage this Friday?', status: 'AI Handling', isOnline: true
    },
    {
      id: '2', name: 'Mike Thomas', avatar: '', initials: 'MT', initialsColor: 'orange',
      time: '15m ago', message: 'Great, confirmed for 2 PM. See you then!', status: 'Booked'
    },
    {
      id: '3', name: 'Jessica Alva', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBZ054eHqqId5GkP3GBf6MjZTftfejCHRduX8RqCfWO_DjLp1p9IndvBaNfdsoHiI6neblmvFjQQ6F5fP6BdLf0rrGdHJAXXIahk1qLWKXiWA6YLMXDQeQjVocqPz9AgIKQ_HFt1KjQVnvoOeTb1ctvKuvtedIPwGj7dNbJlYMxfJ2dCPYJnCrU2Uncl0RcdLBN0b6yiF9BPy0-qtOBtm0U_KmNAkk8ifLtwBe5a-VMcRMiqHmhVLivYgmDCK2VDR9S8WYoFn3nyVO',
      time: '1h ago', message: "I'm not sure if I want the gel or acrylic...", status: 'Human Intervention Needed'
    },
    {
      id: '4', name: 'Katy Adams', avatar: '', initials: 'KA', initialsColor: 'purple',
      time: '3h ago', message: 'Can you send me the address again?', status: 'AI Resolved'
    },
  ];

  const appointments: Appointment[] = [
    { id: '1', name: 'Mike Thomas', service: "Men's Cut & Style", time: '14:00', dayLabel: 'TODAY', isToday: true },
    { id: '2', name: 'Emily R.', service: 'Manicure', time: '15:30', dayLabel: 'TODAY', isToday: true },
    { id: '3', name: 'Alice Wong', service: 'Full Color', time: '09:00', dayLabel: 'TMRW', isToday: false },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Good morning, Luxe Salon</h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1">Here is your daily AI performance overview.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white dark:bg-[#152e2e] px-4 py-2 rounded-full shadow-sm border border-green-100 dark:border-green-900/30">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${!aiActive && 'hidden'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${aiActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </span>
            <span className={`text-sm font-medium ${aiActive ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}>
              {aiActive ? 'WhatsApp Active' : 'AI Paused'}
            </span>
          </div>
          <button 
            onClick={() => setAiActive(!aiActive)}
            className={`font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm ${
                aiActive 
                ? 'bg-primary hover:bg-primary-dark text-white dark:text-background-dark shadow-primary/20' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[1.25rem]">{aiActive ? 'pause_circle' : 'play_circle'}</span>
            {aiActive ? 'Pause AI' : 'Resume AI'}
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
                Recent Conversations
              </h2>
              <button className="text-sm text-primary font-semibold hover:text-primary-dark dark:hover:text-primary/80">View All</button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {conversations.map((chat) => (
                <div key={chat.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {chat.avatar ? (
                        <img alt={chat.name} className="w-10 h-10 rounded-full object-cover" src={chat.avatar} />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            chat.initialsColor === 'orange' ? 'bg-orange-100 text-orange-600' : 
                            chat.initialsColor === 'purple' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {chat.initials}
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
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Right */}
        <div className="flex flex-col gap-6">
          {/* Map */}
          <div className="bg-white dark:bg-[#152e2e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative group h-48">
             <img 
                alt="Map showing salon location" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOctAOqRyeMEHoaUf7h0H3Mz6hbeMi-1_HHfT46GXxy5xS3kWXPdDm6OJ76Xf3NWHoQtThvTG4O7Ij1vxbMkAvoLT51MUl0bEBcCmUQFElccKFqB0U_cH2YFQzNlMCCm094aaZa1IkY8T9NN_wWCgE-Uv9-fABR8FzrMKiM3RqAe4EXtC_kmLg4YfwKHFrZWasT5ykDUB_SYbDmOGuowVdN-QJQOvR0wwxkDgVNpIRgWHAP-HrgCZ5C8MFk2ar2Yg6zt89dacWdi3P"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-white font-bold text-lg">Salon Performance</h3>
                <p className="text-white/80 text-sm">Your AI is optimizing bookings in Los Angeles.</p>
             </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-[#152e2e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex-1">
            <div className="p-6 border-b border-gray-50 dark:border-gray-800">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Next Up</h2>
            </div>
            <div className="p-4 space-y-3">
                {appointments.map((apt) => (
                    <div key={apt.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        apt.isToday 
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
                ))}
            </div>
            <div className="px-6 pb-6 pt-2">
                <button className="w-full py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-semibold text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    View Calendar
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
    }

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${classes}`}>
             <span className={`material-symbols-outlined text-[12px] ${status === 'AI Handling' ? 'animate-pulse' : ''}`}>{icon}</span> {status}
        </span>
    );
};

export default Dashboard;