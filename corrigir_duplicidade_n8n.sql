-- CORREÇÃO PARA ERRO DE DUPLICIDADE NO N8N (UPSERT AUTOMÁTICO)
-- Este script faz com que, se o n8n tentar "Inserir" uma instância que já existe,
-- o banco de dados apenas atualize os dados em vez de dar erro.

CREATE OR REPLACE FUNCTION public.fn_upsert_whatsapp_instance()
RETURNS TRIGGER AS $$
BEGIN
    -- Se já existir uma instância com o mesmo nome, atualizamos o que veio de novo
    -- e cancelamos a inserção original para evitar o erro de duplicidade.
    IF EXISTS (SELECT 1 FROM whatsapp_instances WHERE instance_name = NEW.instance_name) THEN
        UPDATE whatsapp_instances 
        SET 
            status = COALESCE(NEW.status, status),
            phone_number = COALESCE(NEW.phone_number, phone_number),
            updated_at = NOW()
        WHERE instance_name = NEW.instance_name;
        
        RETURN NULL; -- Cancela o INSERT original
    END IF;
    
    RETURN NEW; -- Segue com o INSERT se não houver duplicata
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger
DROP TRIGGER IF EXISTS tr_upsert_whatsapp_instance ON whatsapp_instances;
CREATE TRIGGER tr_upsert_whatsapp_instance
BEFORE INSERT ON whatsapp_instances
FOR EACH ROW EXECUTE FUNCTION public.fn_upsert_whatsapp_instance();
