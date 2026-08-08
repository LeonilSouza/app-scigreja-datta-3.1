export interface CategoriaResumo {
  categoria: string;
  tipo: string;
  total: number;
}

export interface RelatorioCentroCusto {
  centroCusto: string;
  saldoAnterior: number;
  totalReceitas: number;
  totalDespesas: number;
  saldoAtual: number;
  categorias: CategoriaResumo[];
}
