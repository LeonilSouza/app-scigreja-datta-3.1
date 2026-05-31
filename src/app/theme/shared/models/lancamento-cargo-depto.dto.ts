export class LancamentoCargoDeptoDTO {
  constructor(
    public id?: number,
    public dataPosse?: string,
    public dataDesligamento?: string,
    public status?: string,
    public nomeConjunto?: string,
    public nomePessoa?: string,
    public nomeCargo?: string,
    public nomeDepartamento?: string,
    public nomeIgreja?: string,
  
    public igrejaId?: number,
    public pessoaId?: number,
    public cargoId?: number,
    public departamentoId?: number
  ) { }
}