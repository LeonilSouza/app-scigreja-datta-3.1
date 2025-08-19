export class LancamentoDTO {
    constructor(
        public id?: number,
        public nome?: string,
        public historico?: string,
        public documento?: string,
        public data?: string,
        public competencia?: string,
        public tipoLancamento?: string,
        public valor?: string,
        public pessoaId?: number,
        public tituloMin?: string,
        public setorId?: number,
        public igrejaId?: number,
        public contaId?: number,
        public categoriaId?: number,
        public centroCustoId?: number,
        public formaId?: number,
        public contaIdTransferencia?: number,
        public formaIdTransferencia?: number,
        public lancamentoIdTransferencia?: number,
        public tipoConta?: string,
        public tipoContaDestino?: string
        
    ){}
}
