-- COMPATIBILIDADE COM N8N
-- Este script cria "visões" (views) para que o n8n encontre as tabelas que ele espera,
-- mas buscando os dados da nossa nova estrutura isolada.

-- 1. Criar Visão para Horários (Schedules)
CREATE OR REPLACE VIEW instance_schedules AS
SELECT 
    user_id,
    instance_name,
    schedules
FROM ai_agent_configs;

-- 2. Criar Visão para Identidade do Agente (Identity/Description)
-- Caso o n8n procure por 'instance_identity' ou similar
CREATE OR REPLACE VIEW instance_identity AS
SELECT 
    user_id,
    instance_name,
    salon_name,
    description,
    location,
    prices
FROM ai_agent_configs;

-- 3. Garantir Permissões
-- Importante para o n8n conseguir ler as visões
ALTER VIEW instance_schedules OWNER TO postgres;
ALTER VIEW instance_identity OWNER TO postgres;

-- Notificar o cache do PostgREST
NOTIFY pgrst, 'reload schema';
