-- CORREÇÃO COMPLETA PARA WHATSAPP_INSTANCES
-- Adiciona a coluna updated_at que o n8n e o Front-end estão pedindo.

ALTER TABLE whatsapp_instances ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE whatsapp_instances ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Forçar atualização do cache do Supabase
NOTIFY pgrst, 'reload schema';
