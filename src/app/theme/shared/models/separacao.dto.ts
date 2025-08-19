export class SeparacaoDTO {
	  constructor(
		  public id?:number,
		  public pessoaId?: number,
		  public credencial?: string,
		  public apresentadoPor?: string,
		  public dataSeparacao?: string,
		  public localSeparacao?: string,
		  public observacao?: string

	  ){}

  }
