export class AlunoDTO {
    alunoId: number;
    constructor(
        public id?: number,
        public nome?: string,
        public classe?: string,
        public anoLetivo?: string,
        public status?: string,
        public classificacao?: string,
        public telefone?: string,
        public faixaEtaria?: string,
        public dtNascimento?: string,
        public igrejaId?: number,
        public classeId?: number,
        public pessoaId?: number,
    ) { }
}