import { IgrejaDTO } from "./igreja.dto";

export class ConfigDTO {
    constructor(
        public id?: number,
        public nomeIgreja?: string,
        public sequenciaAta?: number,
        public igrejaId?: IgrejaDTO
    ){}
}
