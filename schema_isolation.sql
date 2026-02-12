-- Run this script in your Supabase SQL Editor

-- 1. Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Add instance_name to ai_agent_configs to link configs to specific WhatsApp instances
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_agent_configs' AND column_name = 'instance_name') THEN 
        ALTER TABLE ai_agent_configs ADD COLUMN instance_name TEXT; 
    END IF; 
END $$;

-- 3. Create or Update calendar_sync table for the AI functionality
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

-- 4. Enable RLS on calendar_sync
ALTER TABLE calendar_sync ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for calendar_sync
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
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_sync' AND policyname = 'Users can delete their own calendar sync') THEN 
        CREATE POLICY "Users can delete their own calendar sync" ON calendar_sync FOR DELETE USING (auth.uid() = user_id); 
    END IF;
END $$;

-- 6. Ensure whatsapp_instances table has proper RLS
ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_instances' AND policyname = 'Users can view their own instances') THEN 
        CREATE POLICY "Users can view their own instances" ON whatsapp_instances FOR SELECT USING (auth.uid() = user_id); 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_instances' AND policyname = 'Users can upsert their own instances') THEN 
        CREATE POLICY "Users can upsert their own instances" ON whatsapp_instances FOR INSERT WITH CHECK (auth.uid() = user_id); 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_instances' AND policyname = 'Users can update their own instances') THEN 
        CREATE POLICY "Users can update their own instances" ON whatsapp_instances FOR UPDATE USING (auth.uid() = user_id); 
    END IF;
END $$;
