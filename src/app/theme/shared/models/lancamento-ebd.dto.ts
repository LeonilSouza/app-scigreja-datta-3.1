
export class LancamentoEbdDTO {
    constructor(
        public id?: number,
        public nomeAluno?: string,
        public nomeClasse?: string,
        public anoLetivo?: string,
        public licao?: string,
        public tema?: string,
        public classificacao?: string,
        public trimestre?: string,
        public frequencia?: string,
        public data?: string,
        public p?: number,
        public f?: number,
        public igrejaId?: number,
        public classeId?: number,
        public pessoaId?: number,
        public alunoId?: number
    ) { }
}