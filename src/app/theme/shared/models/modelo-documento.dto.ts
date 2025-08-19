export class ModeloDocumentoDTO {
    constructor(
        public id?: number,
        public nome?: string,
        public tipo?: string,
        public conteudo?: Text,
        public observacao?: string,
        public igrejaId?: number,
        public logo?: string,
    ){}
}
