export class ContaDTO {
    constructor(
        public id?: number,
        public nome?: string,
        public tipo?: string,
        public banco?: string,
        public agencia?: string,
        public numero?: string,
        public saldo?: string,
        public saldoInicial?: string,
        public igrejaId?: number

    ){}
}