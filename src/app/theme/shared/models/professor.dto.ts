export class ProfessorDTO {
    constructor(
        public id?: number,
        public nome?: string,
        public nomeClasse?: string,
        public status?: string,
        public telefone?: string,
        public faixaEtaria?: string,
        public dtNascimento?: string,
        public igrejaId?: number,
        public classificacao?: string,
        public classeId?: number,
        public pessoaId?: number,
    ) { }
}