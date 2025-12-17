export class MatriculaAlunoDTO {
    constructor(
        public id?: number,
        public nomeAluno?: string,
        public nomeClasse?: string,
        public anoLetivo?: string,
        public status?: string,
        public lanca?: string,
        public classificacao?: string,
        public trimestre?: string,
        public frequencia?: string,
        public telefone?: string,
        public faixaEtaria?: string,
        public dtNascimento?: string,
        public igrejaId?: number,
        public classeId?: number,
        public pessoaId?: number,
    ) { }
}