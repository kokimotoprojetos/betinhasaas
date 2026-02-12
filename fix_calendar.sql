-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- This script ensures the isolated calendar table is ready for the new code.

CREATE TABLE IF NOT EXISTS calendar_sync (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    instance_name TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    calendar_id TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, instance_name)
);

-- Enable RLS
ALTER TABLE calendar_sync ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_sync' AND policyname = 'Users can view their own calendar sync') THEN 
        CREATE POLICY "Users can view their own calendar sync" ON calendar_sync FOR SELECT USING (auth.uid() = user_id); 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_sync' AND policyname = 'Users can insert their own calendar sync') THEN 
        CREATE POLICY "Users can insert their own calendar sync" ON calendar_sync FOR INSERT WITH CHECK (auth.uid() = user_id); 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_sync' AND policyname = 'Users can update their own calendar sync') THEN 
        CREATE POLICY "Users can update their own calendar sync" ON calendar_sync FOR UPDATE USING (auth.uid() = user_id); 
    END IF;
END $$;
