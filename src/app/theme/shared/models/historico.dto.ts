export class HistoricoDTO {
	constructor(
		public id?: number,
		public data?: string,
		public usuario?: string,
		public nomeMembro?: string,
		public filho?: string,
		public acao?: string,
		public dadoAntigo?: string,
		public dadoNovo?: string,
		public ocorrencia?: string,
		public dado1?: string,
		public dado2?: string,
		public modulo?: string,
		public pessoaId?: number,
		public igrejaId?: number
	) { }

}
