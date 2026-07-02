export class TotaisDTO {
    totalReceitas: number;
    totalDizimo: number;
    totalOferta: number;
    totalOfertaAlcadas: number;
    totalDespesas: number;
    totalDiversos: number;
    totalEventos: number;
    totalMissoes: number;
    saldoPeriodo: number;
    saldoAnterior: number;

    constructor() {
        this.totalReceitas = 0;
        this.totalDizimo = 0;
        this.totalOferta = 0;
        this.totalDespesas = 0;
        this.totalDiversos = 0;
        this.totalEventos = 0;
        this.saldoPeriodo = 0;
        this.saldoAnterior = 0;
        this.totalMissoes = 0;
        this.totalOfertaAlcadas = 0;

    }
}