import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/landing');
  };

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/' },
    { name: 'WhatsApp Connect', icon: 'chat', path: '/whatsapp' },
    { name: 'Agente de IA', icon: 'smart_toy', path: '/ai-settings' },
    { name: 'Appointments', icon: 'calendar_month', path: '/appointments' },
    { name: 'Clients', icon: 'group', path: '/clients' },
    { name: 'Reports', icon: 'bar_chart', path: '/reports' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-[#152e2e] border-r border-gray-100 dark:border-gray-800 flex-shrink-0 flex flex-col justify-between hidden md:flex transition-all duration-300 h-screen sticky top-0">
      <div>
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <span className="material-symbols-outlined text-3xl">spa</span>
            BeautyConnect
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors group ${isActive
                  ? 'bg-primary/10 text-primary-dark dark:text-primary font-semibold'
                  : 'text-slate-500 hover:bg-gray-50 dark:hover:bg-white/5 dark:text-gray-400'
                }`
              }
            >
              <span className={`material-symbols-outlined ${item.name === 'Dashboard' ? 'icon-filled' : ''} group-hover:text-primary transition-colors`}>
                {item.icon}
              </span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-50 dark:border-gray-800 space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group relative">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase">
            {user?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
              {user?.user_metadata?.full_name || 'Usuário'}
            </p>
            <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          Sair
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;