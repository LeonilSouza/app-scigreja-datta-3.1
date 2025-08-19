export class CategoriaDTO {
    value: string;
  selected: boolean;
    constructor(
        public id?: number,
        public nome?: string,
        public tipo?: string,
        public igrejaId?: number

    ){}
}
