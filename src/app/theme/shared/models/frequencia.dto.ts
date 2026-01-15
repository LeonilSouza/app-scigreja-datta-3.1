// Representa o item individual de presença
export interface FrequenciaItemDTO {
  alunoId: number;
  classeId: number;
  nome: string;
  presente: boolean | null;
}

// Representa o corpo completo da chamada que será enviado ao Spring
export interface FrequenciaDTO {
  id: number;
  presente: boolean | null;
	igrejaId: number;
  classeId: number;
  aulaId: number;
  alunoId: number;
  nomeAluno: string;
  nomeClasse: string;
  anoLetivo: string;
  trimestre: number;
  presencas: FrequenciaItemDTO[];
}

export interface TotaisDiarioDTO {
  classeId: number;
  nomeClasse: string;
  totalPresentes: number;
  totalAusentes: number;
  data: string; // Necessário para o vínculo no Banco de Dados
}

// src/app/models/frequencia.model.ts
export interface FrequenciaResponse {
  id: number;
 presente: boolean | null;
  aluno: {
    id: number;
    nome: string; // Adicione os campos que sua entidade Aluno possui
    classe?: string;
    anoLetivo?: string;
    status?: string;
    classificacao?: string;
    telefone?: string;
    faixaEtaria?: string;
    dtNascimento?: string;
    classeId?: number;
    pessoaId?: number;
  };
  aula: {
    id: number;
    data: string;
  };
}