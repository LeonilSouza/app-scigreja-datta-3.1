
export interface PessoaListDTO {
	id?: number;
	nome?: string;		
	email?: string;		
	sexo?: string;
	bairro?: string;
	situacaoCadastral?: string;		
	telefone1?: string;		
	telefone2?: string;		
	celular1?: string;		
	celular2?: string;	
	aniversario?: string;		
	cargoMinisterial?: string;		
	tempoFe?: string;	
	nomeSemAcento?: string;
			
}

export interface PessoaPatchDTO {
	id?: number;
	situacaoCadastral?: string;				
}


export class PessoaDTO {
	  constructor(
		  public id?:number,
		  public nome?: string,
		  public nomeSemAcento?: string,
		  public email?: string,
		  public cpfOuCnpj?: string,
		  public dataNascimento?: string,
		  public dataCasamento?: string,
		  public sexo?: string, 
		  public cargoPrincipal?: string,
		  public rg?: string,
		  public aniversario?: string,
		  public situacaoCadastral?: string,
		  public situacaoEspiritual?: string,
		  public situacaoMinisterial?: string,
		  public conjuge?: string,
		  public paisNomeSigla?: string,
		  public tempoFe?: string,
		  public cartaoMembro?: string,
		  public idade?: string,
		  public escolaridade?: string,
		  public profissao?: string,
		  public membroDesde?: string,
		  public estadoCivil?: string,
		  public dataConversao?: string,
		  public dataBatismoES?: string,
		  public dataBatismoAguas?: string,
		  public cidadeBatismoAguas?: string,
		  public denominacaoBatismo?: string,
		  public membroRecebidoPor?: string,
		  public nomePai?: string,
		  public nomeMae?: string,
		  public setor?: string,
		  public nomeIgreja?: string,
		  public foto?: string,
		  public nacionalidade?: string,
		  public naturalidade?: string,
		  public ufNatal?: string, // UF de Nascimento. Não tem no bando. Para diferenciar da UF endereço
		  public tipoMembro?: string,
		  public tipoPessoa?: string ,
		  public tituloMin?: string,
		  public abreviacaoMin?: string, //Titulo
		  public abreviaturaMin?: string, // Pessoa
		  public dataCadastro?: string ,
          public urlImagem?: string ,
		  public cep?: string,
		  public logradouro?: number,
		  public numero?: string,
		  public complemento?: string, 
		  public cidadeEndereco?: string,
		  public bairro?: string,
		  public ufEndereco?: string,

		  public telefone1?: string,
		  public telefone2?: string,
		  public celular1?: string,
		  public celular2?: string,
		  public idCidade?: string,
	      public tituloMinisterialId?: number,
		 
		  public igrejaId?: number,
		  public conjugeId?: number,

	  ){}
	  

	  get sstatusAI(): string {
		return this.situacaoCadastral ? 'Ativo' : 'Inativo';
	  }

  }
