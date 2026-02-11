import React, { useState, useEffect } from 'react';

const WhatsAppConnect: React.FC = () => {
  const [timer, setTimer] = useState(14);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setExpired(true);
    }
  }, [timer]);

  const handleReload = () => {
    setTimer(14);
    setExpired(false);
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-6xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <span className="hover:text-primary cursor-pointer">Settings</span>
          <span className="material-icons-round text-base">chevron_right</span>
          <span className="hover:text-primary cursor-pointer">Integrations</span>
          <span className="material-icons-round text-base">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-medium">WhatsApp Connection</span>
        </div>

        {/* Content Card */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-slate-700 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Column: Instructions */}
          <div className="w-full lg:w-5/12 p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-700/50 relative overflow-hidden bg-white dark:bg-[#162e2e]">
            {/* Decorative background blob */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            
            <div>
              <div className="mb-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4 border border-primary/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Setup Guide
                </div>
                <h1 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">Link WhatsApp</h1>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Connect your business account to start automating appointment confirmations and reminders instantly.
                </p>
              </div>

              {/* Step List */}
              <div className="space-y-6 relative z-10">
                <StepItem icon="smartphone" title="Open WhatsApp" desc="Open WhatsApp on your primary phone." />
                <StepItem 
                    icon="more_vert" 
                    title="Go to Settings" 
                    desc={<>Tap <strong className="text-slate-700 dark:text-slate-300">Menu</strong> (Android) or <strong className="text-slate-700 dark:text-slate-300">Settings</strong> (iOS) and select <strong className="text-slate-700 dark:text-slate-300">Linked Devices</strong>.</>} 
                />
                <StepItem 
                    icon="qr_code_scanner" 
                    title="Scan Code" 
                    desc={<>Tap <strong className="text-slate-700 dark:text-slate-300">Link a Device</strong> and point your phone at the screen.</>} 
                />
              </div>
            </div>

            {/* Trust Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex items-center gap-2 text-xs text-slate-400 relative z-10">
              <span className="material-icons-round text-sm text-emerald-500">lock</span>
              <span>End-to-end encrypted connection via Evolution API</span>
            </div>
          </div>

          {/* Right Column: Interactive QR Area */}
          <div className="w-full lg:w-7/12 bg-slate-50 dark:bg-[#132626] flex flex-col items-center justify-center p-8 lg:p-12 relative">
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#13ecec 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
             <div className="relative w-full max-w-sm mx-auto">
                {/* Status Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                   <div className="bg-white dark:bg-surface-dark px-4 py-1.5 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2 whitespace-nowrap">
                      <div className="relative flex h-2.5 w-2.5">
                         <span className={`absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 ${!expired && 'animate-ping'}`}></span>
                         <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${expired ? 'bg-red-500' : 'bg-primary'}`}></span>
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide uppercase">
                        {expired ? 'Code Expired' : 'Waiting for scan...'}
                      </span>
                   </div>
                </div>

                {/* QR Container */}
                <div className="bg-white p-2 rounded-2xl shadow-xl border-4 border-white dark:border-slate-700 relative overflow-hidden group">
                   <div className="aspect-square bg-white rounded-xl overflow-hidden relative">
                      <img 
                        alt="WhatsApp Connection QR Code" 
                        className={`w-full h-full object-contain p-4 transition-opacity duration-300 ${expired ? 'opacity-20 blur-sm' : 'opacity-100'}`}
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt1Ivb7I2hYBOI1qM2EI9kFveR2oR0KDQGpHR07WSA_XBKX2EKkmvmWFL6dFzu8e1M3o7dl3Ue3AFXoXxy2joUDe4sfYroj3fnkkkl72bjInbkt5FbRwBFeVg-R1RN11sBnqhs2sXBmqVvmrrDFQJ8gPMQKTTgmQEbS5wq5o3wmdl9ibJxgVlZMSbb06VNdVkLlFlEhQFdICBwpjvgP_zdyuolTFlfGnOk9LgisMAtIPcPG_4Z53YfSkuz_TwZV8Li0dFjJr8PrLAK"
                      />
                      
                      {!expired && <div className="scan-line z-10 pointer-events-none"></div>}

                      {/* Corner Accents */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg z-10"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg z-10"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg z-10"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg z-10"></div>
                      
                      {/* Reload Overlay */}
                      {expired && (
                         <div 
                            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-20"
                            onClick={handleReload}
                         >
                             <span className="material-icons-round text-4xl text-primary mb-2 animate-bounce">refresh</span>
                             <span className="font-bold text-slate-800">Click to reload QR</span>
                         </div>
                      )}
                   </div>
                </div>

                {/* Timer & Help */}
                <div className="mt-6 flex flex-col items-center gap-3">
                   <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Code expires in <span className={`tabular-nums ${expired ? 'text-red-500' : 'text-slate-900 dark:text-primary'}`}>{timer}s</span>
                   </p>
                   <div className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear" style={{ width: `${(timer / 14) * 100}%` }}></div>
                   </div>
                   <button className="mt-2 text-primary hover:text-primary-dark dark:hover:text-white text-sm font-semibold transition-colors flex items-center gap-1">
                      <span className="material-icons-round text-base">help_outline</span>
                      Having trouble connecting?
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Security Note */}
        <div className="mt-8 text-center">
             <p className="text-xs text-slate-400 dark:text-slate-600 max-w-2xl mx-auto">
                By connecting your WhatsApp account, you agree to BeautyConnect AI's Terms of Service. 
                We strictly use the official WhatsApp Web protocol to ensure your data security. 
                No messages are stored on our servers permanently.
             </p>
        </div>
      </div>
    </div>
  );
};

const StepItem: React.FC<{ icon: string; title: string; desc: React.ReactNode }> = ({ icon, title, desc }) => (
    <div className="flex gap-4 group">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:border-primary transition-all duration-300">
            <span className="material-icons-round">{icon}</span>
        </div>
        <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
        </div>
    </div>
);

export default WhatsAppConnect;