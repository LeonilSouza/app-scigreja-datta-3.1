import { ClasseDTO } from "./classe.dto";
import { PessoaDTO } from "./pessoa.dto";

export class MatriculaProfessorDTO {
    constructor(
        public id?: number,
        public nomeProfessor?: string,
        public nomeClasse?: string,
        public status?: string,
        public telefone?: string,
        public faixaEtaria?: string,
        public dtNascimento?: string,
        public igrejaId?: number,
        public classificacao?: string,
        public classeId?: ClasseDTO,
        public pessoaId?: PessoaDTO,
    ) { }
}