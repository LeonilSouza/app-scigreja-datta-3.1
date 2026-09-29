export interface ItemPrevisao {
  descricao: string;
  nome: string;
  valor: number;
  dataVencimento: string;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
  pessoa: string;
}

export interface PrevisaoPorMes {
  mesAno: string;
  totalPrevisto: number;
  totalPago: number;
  totalPendente: number;
  totalAtrasado: number;
  contas: ItemPrevisao[];
}

export interface PrevisaoFinanceira {
  totalPrevisto: number;
  totalPago: number;
  totalPendente: number;
  totalAtrasado: number;
  percentualGasto: number;
  porMes: PrevisaoPorMes[];
}
