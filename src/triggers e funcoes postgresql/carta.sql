-- COMPORTAMENTO DA TRIGGERS:
-- 01 - Cadastro Pessoa -> Na inclusão de:  Carta de Mudança OU Carta de Mudança Sem Comunhão, o Membro, conjuge e filhos, todos serão alterados para Transferido
-- na situação Cadastral.

-- 02 - Exclusão -> Somente será possivel a exclusão na data de emissao da carta ou posterior.

-- 03 - Cadastro Pessoa -> Quando possibilitar a Exclusão da carta, O Membro, o conjuge e todos os filhos voltam para a condição de Ativo na situação Cadastral.

CREATE OR REPLACE FUNCTION funcao_carta_pessoa_historico()
RETURNS trigger
LANGUAGE 'plpgsql'
AS $BODY$

declare 
 id_pessoa integer; --Variável 
 old_id_pessoa integer; --Variável 
 id_conjuge_id integer; --Variável 
 modelo varchar ( 100); --Variável 
 filho1_id  integer; --Variável
 filho2_id integer; --Variável
 filho3_id integer; --Variável 
 filho4_id integer; --Variável
 
 emissao TIMESTAMP; --Variável 
 destino varchar (150); --Variável 
 cidade varchar (150); --Variável 
 membros varchar (150); --Variável 
 usuario varchar (100); --Variável 
 filhos varchar (350); --Variável 
  
BEGIN
select new.pessoa_id from carta into id_pessoa;
select new.id_conjuge from carta into id_conjuge_id;
select new.id_filho1  from carta into filho1_id;
select new.id_filho2  from carta into filho2_id;
select new.id_filho3  from carta into filho3_id;
select new.id_filho4  from carta into filho4_id;

select new.modelo_carta from carta into modelo;
select new.data_emissao from carta into emissao;
select new.congregacao_destino from carta into destino;
select new.cidade_destino from carta into cidade;
select CONCAT (new.nome_membro, '  -  ', new.conjuge) from carta into membros;
select new.nome_secretario from carta into usuario;
select CONCAT (new.filho1,' - ',  new.filho2,' - ',  new.filho3,'  - ', new.filho4) from carta into filhos;
-- bloco IF que confirmará o tipo de operação.
 
IF (TG_OP = 'INSERT') THEN
	INSERT INTO historico (pessoa_id, usuario, nome_membro, dado2, dado1, modulo, acao, data, filho )
	VALUES (id_pessoa, usuario, membros, cidade, destino, 'Carta', 'Inclusão', current_timestamp, filhos );
	
	if (modelo = 'Mudança')  then
	    if (id_pessoa is not null) then
	       update pessoa set situacao_cadastral = 'Transferido' where id = id_pessoa; 
	    end if;
	  
	--    conjuge
	    if (id_conjuge_id is not null) then
	      update pessoa set situacao_cadastral = 'Transferido' where id = id_conjuge_id; 
	    end if;	
		
	-- 	filho-1
	    if (filho1_id is not null) then
	      update pessoa set situacao_cadastral = 'Transferido' where id = filho1_id; 
	    end if;
	
	-- 	filho-2
	    if (filho2_id is not null) then
	      update pessoa set situacao_cadastral = 'Transferido' where id = filho2_id; 
	    end if;
	
	-- 	filho-3
	    if (filho3_id is not null) then
	      update pessoa set situacao_cadastral = 'Transferido' where id = filho3_id; 
	    end if;
	
	-- 	filho-4
	    if (filho4_id is not null) then
	      update pessoa set situacao_cadastral = 'Transferido' where id = filho4_id; 
	    end if;

	end if;
	RETURN NEW;
	
	-- bloco IF que confirmará o tipo de operação UPDATE.
	ELSIF (TG_OP = 'UPDATE') THEN
 
	RETURN NEW;
	
	-- bloco IF que confirmará o tipo de operação DELETE
	ELSIF (TG_OP = 'DELETE') THEN
	update pessoa set situacao_cadastral = 'Ativo' where id = old.pessoa_id;
	update pessoa set situacao_cadastral = 'Ativo' where id = old.id_conjuge; 
	update pessoa set situacao_cadastral = 'Ativo' where id = old.id_filho1; 
	update pessoa set situacao_cadastral = 'Ativo' where id = old.id_filho2; 
	update pessoa set situacao_cadastral = 'Ativo' where id = old.id_filho3; 
	update pessoa set situacao_cadastral = 'Ativo' where id = old.id_filho4; 
	RETURN NEW;
	END IF;
	RETURN NULL;
	END;
$BODY$

CREATE OR REPLACE TRIGGER  trigger_carta_pessoa_historico
AFTER INSERT OR UPDATE OR DELETE ON carta
FOR EACH ROW
EXECUTE PROCEDURE funcao_carta_pessoa_historico();