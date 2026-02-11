import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/' },
    { name: 'WhatsApp Connect', icon: 'chat', path: '/whatsapp' },
    { name: 'AI Settings', icon: 'smart_toy', path: '/settings' },
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
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors group ${
                  isActive
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
      <div className="p-4 border-t border-gray-50 dark:border-gray-800">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors">
          <img
            alt="Salon Owner Profile Picture"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxAAsU9zks5zrkpRxBo65lUexeSK8bkx3nr6U3JJKLcHbB1-u79L_2YIqv3DdYBrUIRreM2Clb-d8NoM0kyE34jvn8p__cmI5AGJccln44nq8OuKaE5HdFtOTqm_HJ4vZK7qensP-y0vsOS-fCj1Ycgh3uGUoVCAUYysAtd6gforiQ5xk-Urg5udcOuFG0cFnwasv1Fn9b7SYzbQMG-4zQ4nsy-ssv-uRRIwCcD0qasxrxBC-N04PK-yE16CPbySYodg-kAfVNw_OB"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">Elena Rossi</p>
            <p className="text-xs text-slate-500 dark:text-gray-400 truncate">Luxe Salon</p>
          </div>
          <span className="material-symbols-outlined text-gray-400 text-sm">expand_more</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;