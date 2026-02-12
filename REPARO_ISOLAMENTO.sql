-- SCRIPT DE REPARO DEFINITIVO - ISOLAMENTO POR INSTÂNCIA
-- Este script corrige as chaves primárias para permitir que cada instância tenha seus próprios dados.

-- 1. Reparar tabela calendar_sync
DO $$ 
BEGIN 
    -- Remover chave primária antiga baseada apenas no usuário
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'calendar_sync' AND constraint_type = 'PRIMARY KEY') THEN
        ALTER TABLE calendar_sync DROP CONSTRAINT calendar_sync_pkey;
    END IF;

    -- Garantir que a coluna instance_name não seja nula (necessário para PK)
    -- Se houver dados sem instance_name, vamos dar um nome padrão temporário
    UPDATE calendar_sync SET instance_name = 'default' WHERE instance_name IS NULL;
    ALTER TABLE calendar_sync ALTER COLUMN instance_name SET NOT NULL;

    -- Adicionar nova chave primária composta (Usuário + Instância)
    ALTER TABLE calendar_sync ADD PRIMARY KEY (user_id, instance_name);
END $$;

-- 2. Reparar tabela ai_agent_configs
DO $$ 
BEGIN 
    -- Remover chave primária antiga
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'ai_agent_configs' AND constraint_type = 'PRIMARY KEY') THEN
        ALTER TABLE ai_agent_configs DROP CONSTRAINT ai_agent_configs_pkey;
    END IF;

    -- Garantir que a coluna instance_name não seja nula
    UPDATE ai_agent_configs SET instance_name = 'default' WHERE instance_name IS NULL;
    -- Se instance_name ainda for nula após o update (tabela vazia), o alter funcionará.
    ALTER TABLE ai_agent_configs ALTER COLUMN instance_name SET NOT NULL;

    -- Adicionar nova chave primária composta
    ALTER TABLE ai_agent_configs ADD PRIMARY KEY (user_id, instance_name);
END $$;

-- 3. Garantir Políticas de RLS atualizadas
ALTER TABLE calendar_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_configs ENABLE ROW LEVEL SECURITY;

-- As políticas baseadas em auth.uid() = user_id continuam válidas e seguras!
