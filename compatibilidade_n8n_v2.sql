-- AJUSTE DE COMPATIBILIDADE - NOMES DE COLUNAS N8N
-- O n8n procura pelo nome antigo 'whatsapp_instance_id'. 
-- Vamos criar um apelido (alias) para que ele encontre o dado no nosso novo 'instance_name'.

-- 1. Atualizar Visão de Horários
CREATE OR REPLACE VIEW instance_schedules AS
SELECT 
    user_id,
    instance_name as whatsapp_instance_id, -- Apelido para o n8n
    instance_name,
    schedules
FROM ai_agent_configs;

-- 2. Atualizar Visão de Identidade
CREATE OR REPLACE VIEW instance_identity AS
SELECT 
    user_id,
    instance_name as whatsapp_instance_id, -- Apelido para o n8n
    instance_name,
    salon_name,
    description,
    location,
    prices
FROM ai_agent_configs;

-- Notificar o cache
NOTIFY pgrst, 'reload schema';
