
export class ClasseDTO {
    constructor(
        public id?: number,
        public nome?: string,
        public status?: string,
        public classificacao?: string,
        public faixaEtaria?: string,
        public igrejaId?: number
    ) {}
}