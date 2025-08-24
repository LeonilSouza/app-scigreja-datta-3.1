CREATE OR REPLACE FUNCTION funcao_caso_pessoa_historico()
RETURNS trigger
LANGUAGE 'plpgsql'
AS $BODY$

declare 
 situacao varchar (50); --Variável 
 id_pessoa integer; --Variável 
 old_id_pessoa integer; --Variável 
 
BEGIN
select new.pessoa_id from caso into id_pessoa;
select new.situacao from caso into situacao;
select old.pessoa_id from caso into old_id_pessoa;

-- bloco IF que confirmará o tipo de operação.

IF (TG_OP = 'INSERT') THEN
 update pessoa set situacao_espiritual = 'Prova' where id = id_pessoa; 
RETURN NEW;

-- bloco IF que confirmará o tipo de operação UPDATE.
ELSIF (TG_OP = 'UPDATE') THEN
 if (situacao = 'Comunhão')  then
	update pessoa set situacao_espiritual = 'Comunhão' where id = id_pessoa; 
 end if;

 if (situacao = 'Arquivado')  then
	update pessoa set situacao_espiritual = 'Arquivado' where id = id_pessoa; 
 end if;

 if (situacao = 'Desligado')  then
	update pessoa set situacao_espiritual = 'Desligado' where id = id_pessoa; 
	update pessoa set situacao_cadastral = 'Inativo' where id = id_pessoa; 
 end if;
 
RETURN NEW;

-- bloco IF que confirmará o tipo de operação DELETE
ELSIF (TG_OP = 'DELETE') THEN
update pessoa set situacao_espiritual = 'Comunhão' where id = old_id_pessoa; 
RETURN NEW;
END IF;
RETURN NULL;
END;
$BODY$

CREATE OR REPLACE TRIGGER  trigger_caso_pessoa_hitorico
AFTER INSERT OR UPDATE OR DELETE ON caso
FOR EACH ROW
EXECUTE PROCEDURE funcao_caso_pessoa_historico();