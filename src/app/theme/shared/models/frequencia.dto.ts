// Representa o item individual de presença
export interface FrequenciaItemDTO {
  alunoId: number;
  classeId: number;
  nome: string;
  presente: boolean;
}

// Representa o corpo completo da chamada que será enviado ao Spring
export interface FrequenciaDTO {
  presente: boolean;
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

// Opcional: Interface para carregar os dados da Aula (para preencher o Select)
export interface Aula {
  id: number;
  data?: string; // Usamos string para facilitar a manipulação de datas do JSON
}


// src/app/models/frequencia.model.ts
export interface FrequenciaResponse {
  id: number;
  presente: boolean;
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