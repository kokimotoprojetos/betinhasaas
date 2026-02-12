-- SOLUÇÃO PARA O ERRO DE USER_ID NO N8N
-- Este script permite que o n8n salve a instância sem precisar do user_id manualmente.
-- O banco de dados vai "descobrir" o user_id sozinho pelo nome da instância.

-- 1. Permitir que user_id seja nulo temporariamente durante o insert
ALTER TABLE whatsapp_instances ALTER COLUMN user_id DROP NOT NULL;

-- 2. Criar função para descobrir o user_id pelo prefixo da instância
CREATE OR REPLACE FUNCTION public.fn_auto_link_instance_user()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    prefix TEXT;
BEGIN
    -- Se o user_id já veio preenchido, não fazemos nada
    IF NEW.user_id IS NOT NULL THEN
        RETURN NEW;
    END IF;

    -- Se o nome da instância segue o padrão user_XXXXXXXX
    IF NEW.instance_name LIKE 'user_%' THEN
        prefix := SUBSTRING(NEW.instance_name FROM 6 FOR 8);
        
        -- Procurar o usuário que começa com esse prefixo
        SELECT id INTO target_user_id 
        FROM auth.users 
        WHERE id::text LIKE prefix || '%'
        LIMIT 1;

        IF target_user_id IS NOT NULL THEN
            NEW.user_id := target_user_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar o trigger
DROP TRIGGER IF EXISTS tr_auto_link_instance_user ON whatsapp_instances;
CREATE TRIGGER tr_auto_link_instance_user
BEFORE INSERT OR UPDATE ON whatsapp_instances
FOR EACH ROW EXECUTE FUNCTION public.fn_auto_link_instance_user();
