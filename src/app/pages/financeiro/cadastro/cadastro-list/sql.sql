-- Cria a coluna (sem NOT NULL por enquanto, pois já existem registros)
ALTER TABLE categoria
    ADD COLUMN IF NOT EXISTS especificacao VARCHAR(30);

-- Preenche todas as categorias existentes com o valor padrão
UPDATE categoria
SET especificacao = 'PADRAO'
WHERE especificacao IS NULL;

-- (Opcional) Ajustes pontuais por nome. Adapte aos nomes reais das suas categorias
-- UPDATE categoria SET especificacao = 'TRANSFERENCIA' WHERE nome ILIKE '%transfer%';
-- UPDATE categoria SET especificacao = 'EVENTOS'       WHERE nome ILIKE '%evento%';
-- UPDATE categoria SET especificacao = 'PERMUTA'       WHERE nome ILIKE '%permuta%';

-- Só depois de tudo preenchido, trava a coluna
ALTER TABLE categoria
    ALTER COLUMN especificacao SET DEFAULT 'PADRAO',
    ALTER COLUMN especificacao SET NOT NULL;

-----------------------------------------------------------------------------------------------------------

BEGIN;

-- Despesa de uso particular
UPDATE categoria SET especificacao = 'PARTICULAR'   WHERE id IN (33);

-- Receitas e despesas avulsas
UPDATE categoria SET especificacao = 'DIVERSAS'     WHERE id IN (20);

-- Receitas de eventos (cantina, feira, marmitex, frango, passarela)
UPDATE categoria SET especificacao = 'EVENTOS'      WHERE id IN (5, 35, 36, 37, 38, 39);

-- Repasses e valores enviados a outra unidade
UPDATE categoria SET especificacao = 'TRANSFERENCIA' WHERE id IN (8, 29);

--Permuta
UPDATE categoria SET especificacao = 'PERMUTA' WHERE id IN (6, 28);

-- Confira antes de confirmar
SELECT id, nome, especificacao FROM categoria ORDER BY especificacao, nome;

COMMIT;