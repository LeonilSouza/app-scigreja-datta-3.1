export class FilhoDTO {
    constructor(
        public id?: number,
        public nome?: string,
        public email?: string,
        public sexo?: string,
        public dataNascimento?: string,
        public cadastrado?: string,
        public pessoaId?: number,
    ){}
}
