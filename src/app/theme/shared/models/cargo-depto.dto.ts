export class CargoDeptoDTO {
    constructor(
        public id?: number,
        public nomePessoa?: string,
        public nomeConjunto?: string,
        public nomeDepartamento?: string,
        public nomeCargo?: string,
        public data?: string,
        public departamentoId?: number,
        public pessoaId?: number,
        public cargoId?: number,
        public igrejaId?: number
    ){}
}
