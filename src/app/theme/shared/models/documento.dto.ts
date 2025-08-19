import { PessoaDTO } from "./pessoa.dto";

export class DocumentoDTO {
    constructor(
        public id?: number,
        public nomeArquivo?: string,
        public descricao?: string,
        public arquivo?: string,
        public data?: string,
        public igrejaId?: number,
        public pessoaId?: PessoaDTO,
    ){}
}
