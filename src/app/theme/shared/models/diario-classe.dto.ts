
export class DiarioClasseDTO {
    constructor(
        public id?: number,
        public nomeProfessor?: string,
        public nomeClasse?: string,
        public data?: string,
        public licao?: string,
        public tema?: string,
        public classificacao?: string,
        public totalOfertas?: string,
        public totalMatriculados?: number,
        public totalPresentes?: number,
        public totalAusentes?: number,
        public totalVisitantes?: number,
        public totalBiblias?: number,
        public totalRevistas?: number,
        public percentualPresentes?: string,
        public igrejaId?: number,
        public classeId?: number,
    ) { }
}