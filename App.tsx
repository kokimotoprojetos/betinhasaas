import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WhatsAppConnect from './pages/WhatsAppConnect';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import AIAgentSettings from './pages/AIAgentSettings';
import Appointments from './pages/Appointments';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Debug: Log complete hash to see if tokens are arriving
    console.log('--- DEBUG: URL HASH ATUAL ---');
    console.log(window.location.hash);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      // Global capture of Google tokens
      // Global capture of Google tokens
      if (session?.provider_token && session?.user) {
        console.log('--- DIAGNÓSTICO GOOGLE OAUTH ---');
        console.log('User ID:', session.user.id);

        const providerToken = session.provider_token;
        const providerRefreshToken = session.provider_refresh_token;
        const instanceName = `user_${session.user.id.substring(0, 8)}`;

        console.log('Tentando salvar tokens na instância:', instanceName);

        // Save to the new isolated table
        const { error } = await supabase
          .from('calendar_sync')
          .upsert({
            user_id: session.user.id,
            instance_name: instanceName,
            access_token: providerToken,
            refresh_token: providerRefreshToken,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,instance_name' });

        if (error) {
          console.error('ERRO AO SALVAR NA CALENDAR_SYNC:', error);
          alert('ERRO DE BANCO DE DADOS: ' + error.message + '\n\nCertifique-se de rodar o script REPARO_ISOLAMENTO.sql no Supabase.');
        } else {
          console.log('SUCESSO: Google tokens salvos e isolados!');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/landing" element={!session ? <Landing /> : <Navigate to="/" replace />} />
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" replace />} />

        {/* Private Routes (Wrapped in Layout) */}
        <Route path="/" element={session ? <Layout /> : <Navigate to="/landing" replace />}>
          <Route index element={<Dashboard />} />
          <Route path="whatsapp" element={<WhatsAppConnect />} />
          <Route path="ai-settings" element={<AIAgentSettings />} />
          <Route path="appointments" element={<Appointments />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;