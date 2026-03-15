export class ContasPagarDTO {
    constructor(
        public id?: number,
        public descricao?: string,
        public nome?: string,
        public saldoResidual?: string,
        public frequenciaCP?: string,
        public valor?: number,
        public dataVencimento?: string, // Formato "dd/MM/yyyy" que definimos no @JsonFormat
        public dataPagamento?: string,
        public status?: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ATRASADO',
        public igrejaId?: number,
        public quantidadeParcelas?: number,
        public pessoaId?: number,
        public pessoa?: {
            id: number;
            nome?: string;
        }
    ) { }
}

export class ContasPagarResumoDTO {
    constructor(
        public totalPago?: string,
        public totalPendente?: string,
        public totalAtrasado?: string,
    ) {}
}