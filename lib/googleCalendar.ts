import { supabase } from './supabase';

export const googleCalendar = {
    async getEvents(userId: string) {
        const instanceName = `cal_${userId.substring(0, 8)}`;
        const { data: config, error: configError } = await supabase
            .from('calendar_sync')
            .select('*')
            .eq('user_id', userId)
            .eq('instance_name', instanceName)
            .single();

        if (configError || !config || !config.access_token) {
            throw new Error('Google Calendar not connected');
        }

        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${config.calendar_id || 'primary'}/events?timeMin=${new Date().toISOString()}&maxResults=10&orderBy=startTime&singleEvents=true`, {
            headers: {
                'Authorization': `Bearer ${config.access_token}`
            }
        });

        if (response.status === 401) {
            // Token expired. In a full implementation, you would trigger a refresh here.
            throw new Error('Unauthorized: Google token may be expired. Please reconnect.');
        }

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Failed to fetch events');
        }

        return await response.json();
    },

    async createEvent(userId: string, event: { summary: string; start: string; end: string; description?: string }) {
        const instanceName = `cal_${userId.substring(0, 8)}`;
        const { data: config, error: configError } = await supabase
            .from('calendar_sync')
            .select('*')
            .eq('user_id', userId)
            .eq('instance_name', instanceName)
            .single();

        if (configError || !config || !config.access_token) {
            throw new Error('Google Calendar not connected');
        }

        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${config.calendar_id || 'primary'}/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                summary: event.summary,
                description: event.description,
                start: { dateTime: event.start },
                end: { dateTime: event.end }
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'Failed to create event');
        }

        return await response.json();
    }
};
