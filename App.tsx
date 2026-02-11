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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      // Global capture of Google tokens
      if (session?.provider_token && session?.user) {
        console.log('Capturing Google tokens globally...');
        const providerToken = session.provider_token;
        const providerRefreshToken = session.provider_refresh_token;

        // Save to DB
        await supabase
          .from('google_calendar_configs')
          .upsert({
            user_id: session.user.id,
            access_token: providerToken,
            refresh_token: providerRefreshToken, // session usually only has this on first login
            is_enabled: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        console.log('Google tokens saved!');
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