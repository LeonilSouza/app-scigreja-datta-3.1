export interface ContasPagarDTO {
    id?: number;
    descricao: string;
    frequencia: string;
    saldoResidual: string;
    valor: number;
    dataVencimento: string; // Formato "dd/MM/yyyy" que definimos no @JsonFormat
    dataPagamento?: string;
    formaPagamento: 'DINHEIRO' |'TRANSFERENCIA' | 'PIX' | 'CARTAO' | 'CHEQUE';
    status: 'PENDENTE' | 'RECEBIDO' | 'CANCELADO' | 'ATRASADO';
    igrejaId: number;
    pessoa: {
        id: number;
        nome?: string
    };
}

// export class ContasPagarDTO {
//     constructor(
//         public id?: number,
//         public descricao?: string,
//         public valor?: string,
//         public frequencia?: string, //Semanal|Mensal |etc..
//         public saldoResidual?: string,
//         public dataVencimento?: string,
//         public dataPagamento?: string,
//         public formaPagamento?: string,
//         public status?: string,
//         public igrejaId?: number,
//         public pessoaId?: number,
//     ) { }
// }

