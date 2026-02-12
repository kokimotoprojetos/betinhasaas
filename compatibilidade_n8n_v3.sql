-- AJUSTE DE COMPATIBILIDADE V3 (CORREÇÃO DE COLUNAS)
-- Para evitar o erro do Supabase, vamos apagar as visões antigas e criá-las do zero.

-- 1. Remover visões antigas para poder mudar os nomes das colunas
DROP VIEW IF EXISTS instance_schedules;
DROP VIEW IF EXISTS instance_identity;

-- 2. Criar Visão para Horários (Schedules) com os apelidos que o n8n precisa
CREATE VIEW instance_schedules AS
SELECT 
    user_id,
    instance_name as whatsapp_instance_id, -- Nome que o n8n espera
    instance_name,
    schedules
FROM ai_agent_configs;

-- 3. Criar Visão para Identidade do Agente (Description/Prices)
CREATE VIEW instance_identity AS
SELECT 
    user_id,
    instance_name as whatsapp_instance_id, -- Nome que o n8n espera
    instance_name,
    salon_name,
    description,
    location,
    prices
FROM ai_agent_configs;

-- 4. Garantir permissões e atualizar cache
ALTER VIEW instance_schedules OWNER TO postgres;
ALTER VIEW instance_identity OWNER TO postgres;
NOTIFY pgrst, 'reload schema';
