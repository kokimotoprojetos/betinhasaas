import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial session fetch
        const initSession = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                setSession(initialSession);
                setUser(initialSession?.user || null);
            } catch (err) {
                console.error('Auth check error:', err);
            } finally {
                setLoading(false);
            }
        };

        initSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user || null);
            setLoading(false);

            try {
                // Global capture of Google tokens
                if (session?.provider_token && session?.user) {
                    const providerToken = session.provider_token;
                    const providerRefreshToken = session.provider_refresh_token;
                    const user_id = session.user.id;
                    const instanceName = `user_${user_id.substring(0, 8)}`;

                    console.log('Sync: Global token capture detected in Context');

                    await supabase
                        .from('calendar_sync')
                        .upsert({
                            user_id: user_id,
                            instance_name: instanceName,
                            access_token: providerToken,
                            refresh_token: providerRefreshToken,
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'user_id,instance_name' });
                }
            } catch (err) {
                console.warn('Sync error in AuthContext:', err);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            console.log('AuthContext: Iniciando logout agressivo');

            // 1. Clear Supabase local storage explicitly
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('supabase') || key.includes('sb-'))) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));

            // 2. Attempt normal sign out
            await supabase.auth.signOut().catch(e => console.warn('Supabase signOut error (ignoring):', e));

            // 3. Clear local session state
            setSession(null);
            setUser(null);

            // 4. Force hard redirect to landing page
            window.location.href = '#/landing';
            window.location.reload();
        } catch (err) {
            console.error('Logout fatal error:', err);
            window.location.href = '#/landing';
            window.location.reload();
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
