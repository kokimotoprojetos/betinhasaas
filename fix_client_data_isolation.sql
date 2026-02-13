-- FIX CLIENT DATA ISOLATION
-- This script adds the missing instance isolation columns to client_data table
-- to ensure compatibility with n8n and multi-tenant safety.

-- 1. Add columns if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_data' AND column_name = 'instance_id') THEN 
        ALTER TABLE client_data ADD COLUMN instance_id TEXT; 
    END IF; 

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'client_data' AND column_name = 'instance_name') THEN 
        ALTER TABLE client_data ADD COLUMN instance_name TEXT; 
    END IF; 
END $$;

-- 2. Populate columns for existing records (fallback to 'default')
UPDATE client_data SET instance_name = 'default' WHERE instance_name IS NULL;
UPDATE client_data SET instance_id = instance_name WHERE instance_id IS NULL;

-- 3. Update RLS policies to include instance_name check if desired
-- Current: (auth.uid() = user_id)
-- We keep it as is since user_id is already the primary filter for security.
-- But we can add a view for n8n to simplify queries.

-- 4. Create compatibility view for n8n if it expects a specific format
CREATE OR REPLACE VIEW instance_clients AS
SELECT 
    id,
    user_id,
    instance_id as whatsapp_instance_id,
    instance_name,
    phone,
    name,
    email,
    whatsapp,
    notes,
    last_interaction,
    created_at
FROM client_data;

ALTER VIEW instance_clients OWNER TO postgres;

-- 5. Reload schema cache
NOTIFY pgrst, 'reload schema';
