import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <Sidebar />
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      
      {/* Mobile Sidebar (Simplified for demo) */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#152e2e] z-50 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar /> {/* Reusing Sidebar component inside mobile drawer logic would require refactoring, but for now we rely on the hidden md:flex class in Sidebar. Let's make a mobile version or just assume desktop-first for code brevity, but let's handle the toggle at least. */}
         <div className="h-full flex flex-col p-4">
             <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-primary">BeautyConnect</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                    <span className="material-symbols-outlined">close</span>
                </button>
             </div>
             {/* Simple Nav for Mobile */}
             <nav className="space-y-2">
                 <a href="#/" className="block px-4 py-2 rounded-lg bg-primary/10 text-primary-dark font-medium">Dashboard</a>
                 <a href="#/whatsapp" className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-300">WhatsApp Connect</a>
             </nav>
         </div>
      </div>

      <main className="flex-1 overflow-y-auto w-full relative">
         {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#152e2e] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20">
            <div className="flex items-center gap-2 text-primary font-bold">
                <span className="material-symbols-outlined">spa</span>
                BeautyConnect
            </div>
            <button className="text-slate-500" onClick={() => setIsMobileMenuOpen(true)}>
                <span className="material-symbols-outlined">menu</span>
            </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default Layout;