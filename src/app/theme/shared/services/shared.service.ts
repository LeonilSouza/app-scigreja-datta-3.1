import { EventEmitter, Injectable } from "@angular/core";

import moment from 'moment';

const data = new Date();

@Injectable()
export class SharedService {

  eventIgrejaId = new EventEmitter<any>();
  eventSetorId = new EventEmitter<any>();
  eventNomeIgreja = new EventEmitter<any>();
  eventCroppedImage = new EventEmitter<any>();
  eventPessoaId = new EventEmitter<any>();

  eventNomeUsuario = new EventEmitter<any>();
  eventFotoUsuario = new EventEmitter<any>();
  eventPerfil = new EventEmitter<string>();

  private igrejaId: number;
  private setorId: number;
  private nomeIgreja: string;
  private pessoaId: number;
  private croppedImage: any;

  private fotoUsuario: string;
  private nomeUsuario: string;
  private perfil: string;

  dataAtual: any = moment();

  constructor(
  ) {
  }


  formataDataUS(data) { // Data a converter = "dd/mm/yyyy" Retorna data formatada "yyyy-mm-dd"
    let data_americana = data.split('/').reverse().join('-');
    return data_americana;
  }

  formataDataBR(data) {// Data a converter = "yyyy-mm-dd" Retorna data formatada "dd/mm/yyyy"
    let data_brasileira = data.split('-').reverse().join('/');
    return data_brasileira;
  }

  dataSubDay(data, day) { //Subtrae um dia na data - Metodo exclusivo para pegar o dia anterior as 23h:59m
    const strinDate = data + 'T23:59:00'
    const date = new Date(strinDate);
    date.setDate(date.getDate() - day)
    return date.toLocaleDateString();
  }


  calcularIdade(aniversario) {
    var nascimento = aniversario.split("/");
    var dataNascimento = new Date(parseInt(nascimento[2], 10),
      parseInt(nascimento[1], 10) - 1,
      parseInt(nascimento[0], 10));

    var diferenca = Date.now() - dataNascimento.getTime();
    var idade = new Date(diferenca);

    return Math.abs(idade.getUTCFullYear() - 1970);
  }

  dataAtualFormatada() {
    let data = new Date(),
      dia = data.getDate().toString().padStart(2, '0'),
      mes = (data.getMonth() + 1).toString().padStart(2, '0'),
      ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;

  }

  // dataHoraAtualFormatada() {
  //   let data = new Date(),
  //     dia = data.getDate().toString().padStart(2, '0'),
  //     mes = (data.getMonth() + 1).toString().padStart(2, '0'),
  //     ano = data.getFullYear();
      
  //     let hora = data.getHours();
  //     let minuto = data.getMinutes();

  //   return `${dia}/${mes}/${ano}`+ " às "+ `${hora}:${minuto}`;
  // }

  rangeMesAtual() {
    let data = new Date();
    const lastDay = new Date(data.getFullYear(), data.getMonth() + 1, 0);
    const lastDayDate = lastDay.toLocaleDateString();

    const firstDay = new Date(data.getFullYear(), data.getMonth(), 1);
    const firstDayDate = firstDay.toLocaleDateString()

    return firstDayDate + " - " + lastDayDate;

  }

  rangeMesAnterior() {
    let data = new Date();

    const firstDay = new Date(data.getFullYear(), data.getMonth() - 3, 1);
    const firstDayDate = firstDay.toLocaleDateString()

    const lastDay = new Date(data.getFullYear(), data.getMonth() - 0, 0);
    const lastDayDate = lastDay.toLocaleDateString();

    return firstDayDate + " - " + lastDayDate;

  }

  primeiroDiaMes() {
    let data = new Date();
    const firstDay = new Date(data.getFullYear(), data.getMonth(), 1);
    const firstDayDate = firstDay.toLocaleDateString()

    return firstDayDate;

  }

  primeiroDiaMesAnterior() {
    let data = new Date();
    const firstDay = new Date(data.getFullYear(), data.getMonth() - 1, 1);
    const firstDayDate = firstDay.toLocaleDateString()

    return firstDayDate;
  }

  ultimoDiaMes() {
    let data = new Date();
    const lastDay = new Date(data.getFullYear(), data.getMonth() + 1, 0);
    const lastDayDate = lastDay.toLocaleDateString();

    return lastDayDate;

  }

  dataUltimoDiaMesAnterior() {
    let data = new Date();
    const lastDay = new Date(data.getFullYear(), data.getMonth() - 0, 0);
    const lastDayDate = lastDay.toLocaleDateString();

    return lastDayDate;

  }

  mesAno() {// 00/0000
    let data = new Date(),
      dia = data.getDate().toString().padStart(2, '0'),
      mes = (data.getMonth() + 1).toString().padStart(2, '0'),
      ano = data.getFullYear();
    return `${mes}/${ano}`;

  }

  mesAnoExtenso() {
    moment.locale('pt-BR');
    return moment().format('MMMM/YYYY'); // setembro - 2024
  }

  dataAtualExtenso() {
    moment.locale('pt');
    moment().format('MMMM Do YYYY, h:mm:ss a'); // Julho 20º 2017, 11:42:53 pm
    moment().format('dddd');                    // Quinta-Feira
    moment().format("MMM Do YY");               // Jul 20º 17
    moment().format('YYYY [escaped] YYYY');     // 2017 escaped 2017
    moment().format('LLLL'); // Quinta-Feira, 20 de Julho de 2017 23:49
    moment().format('LLL'); //  31 de dezembro ulho de 2017 23:49

    return (moment().format('LLLL'));
  }

  // Formata Strings com a primeira maiuscula e de/do/da/dos/das tudo em minusculo
  formataNome(nome: string) {
    return nome.toLowerCase().replace(/(?:^|\s)(?!da |de |do |das |dos)\S/g, l => l.toUpperCase());
  };

  formatCnpjCpf(value) {
    const cnpjCpf = value.replace(/\D/g, '');

    if (cnpjCpf.length === 11) {
      return cnpjCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "\$1.\$2.\$3-\$4");
    }

    return cnpjCpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "\$1.\$2.\$3/\$4-\$5");
  }

  //Igreja nome
  getNomeIgreja() {
    return this.nomeIgreja;
  }

  setNomeIgreja(nome: string) {
    this.nomeIgreja = nome;
    this.eventNomeIgreja.emit(nome);
  }

  //Igreja Id
  getIgrejaId() {
    return this.igrejaId;
  }

  setIgrejaId(igrejaId: number) {
    this.igrejaId = igrejaId;
    this.eventIgrejaId.emit(igrejaId);
  }

  //Setor Id
  getSetorId() {
    return this.setorId;
  }

  setSetorId(setorId: number) {
    this.setorId = setorId;
    this.eventSetorId.emit(setorId);
  }

  //PessoaId
  getPessoaId() {
    return this.pessoaId;
  }

  setPessoaId(id: number) {
    this.pessoaId = id;
    this.eventPessoaId.emit(id);
  }

  //Usuario
  getFotoUsuario() {
    return this.fotoUsuario;
  }

  setFotoUsuario(foto: string) {
    this.fotoUsuario = foto;
    this.eventFotoUsuario.emit(foto);
  }

  //Perfil usuario
  getPerfil() {
    return this.perfil;
  }

  setPerfil(perfil: string) {
    this.perfil = perfil;
    this.eventPerfil.emit(perfil);
  }

  //Nome usuario
  getNomeUsuario() {
    return this.nomeUsuario;
  }

  setNomeUsuario(nome: string) {
    this.nomeUsuario = nome;
    this.eventNomeUsuario.emit(nome);
  }

  //Foto Pessoa
  getCroppedImage() {
    return this.croppedImage;
  }

  setCroppedImage(croppedImage: string) {
    this.croppedImage = croppedImage;
    this.eventCroppedImage.emit(croppedImage);
  }

  //  METODOS AUXILIARES PARA DATAS

  //  METODOS AUXILIARES PARA DATAS
  // Adiciona um dia na data passada como parametro ESTE É PARA E DATA E HORA JUNTOS
  addDays(data, dias) {
    data = moment(data).add(dias, 'days').format("YYYY-MM-DDTHH:MM");
    return data;
  }

  // Subtrae um dia da data passada como parametro ESTE É PARA E DATA E HORA JUNTOS
  subDays(data, dias) {
    data = moment(data).subtract(dias, 'days').format("YYYY-MM-DDTHH:MM");
    return data;
  }

  subDays2(data, dias) {
    moment.locale('pt-BR');
    data = moment(data).subtract(dias, 'days').format("DD/MM/YYYY");
    return data;
  }

  dataSubDays(data, days) {
    const strinDate = '2024-09-20T00:00:00'
    const date = new Date(strinDate);
    date.setDate(date.getDate() - 1)
    console.log(date.toLocaleDateString());

  }

  dataAddMes(dt, qtdMes) { //Salvou minha vida// Adiciona mes em qualquer data.// Ate Formatada
    var dia;
    var mes
    var data = dt.split("/");
    var hj1 = data[2] + "-" + data[1] + "-" + data[0];
    var dtat = new Date(hj1);
    dtat.setDate(dtat.getDate());
    var myDate = new Date(hj1);
    myDate.setMonth(myDate.getMonth() + (qtdMes));
    var ano = myDate.getFullYear();
    dia = myDate.getDate(); if (dia < 10) { dia = '0' + dia };
    mes = (myDate.getMonth() + 1); if (mes < 10) { mes = '0' + mes }
    return (dia + "/" + mes + "/" + ano);
  }


  private dataAddDia(dias) { // Retorna a data Atual mais dias
    return this.dataAtual.add(dias, 'days').format('L');
  }

  private dataAddMesDataAtual(mes) { // Retorna a data Atual "Apenas" mais meses// Outras datas não funciona
    return this.dataAtual.add(mes, 'month').format('L');
  }

  private dataAddAno(ano) { // Retorna a data Atual mais anos
    return this.dataAtual.add(ano, 'years').format('L');
  }

  // FIM DATA


  // Pesquisa CEP
  getDataCep(cep): any {
    let url: string = `https://viacep.com.br/ws/${cep}/json/`;
    return fetch(url)
      .then(this.handleErrors);
  }

  // Pesquisa Países
  getDataPaises(): any {
    let url: string = `https://servicodados.ibge.gov.br/api/v1/localidades/paises?orderBy=nome`;
    return fetch(url)
      .then(this.handleErrors);
  }

  // Pesquisa Estados
  getDataEstados(): any {
    let url: string = `https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome`;
    return fetch(url)
      .then(this.handleErrors);
  }

  // Pesquisa Cidades
  getDataCidades(): any {
    let url: string = `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome`;
    return fetch(url)
      .then(this.handleErrors);

  }
  getDataCidade(id): any {
    let url: string = `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${id}`;
    return fetch(url)
      .then(this.handleErrors);
  }

  getDataEstado(id): any {
    let url: string = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${id}`;
    return fetch(url)
      .then(this.handleErrors);
  }

  getDataPaisesById(id): any {
    let url: string = `https://servicodados.ibge.gov.br/api/v1/localidades/paises/${id}`;
    return fetch(url)
      .then(this.handleErrors);
  }

  handleErrors(response: any) {
    if (!response.ok) {
      alert('Buscando API: Servico Indisponível')
    }
    return response;
  }

  // remove acentos e trasforma em minusculas
  removerAcentos(s) {
    var map = { "â": "a", "Â": "A", "à": "a", "À": "A", "á": "a", "Á": "A", "ã": "a", "Ã": "A", "ê": "e", "Ê": "E", "è": "e", "È": "E", "é": "e", "É": "E", "î": "i", "Î": "I", "ì": "i", "Ì": "I", "í": "i", "Í": "I", "õ": "o", "Õ": "O", "ô": "o", "Ô": "O", "ò": "o", "Ò": "O", "ó": "o", "Ó": "O", "ü": "u", "Ü": "U", "û": "u", "Û": "U", "ú": "u", "Ú": "U", "ù": "u", "Ù": "U", "ç": "c", "Ç": "C" };

    return s.replace(/[\W\[\] ]/g, function (a) { return map[a] || a }).toLowerCase()
  };


  // Valida CPF

  validaCPF(cpf) {
    var Soma = 0
    var Resto

    var strCPF = String(cpf).replace(/[^\d]/g, '')

    if (strCPF.length !== 11)
      return false

    if ([
      '00000000000',
      '11111111111',
      '22222222222',
      '33333333333',
      '44444444444',
      '55555555555',
      '66666666666',
      '77777777777',
      '88888888888',
      '99999999999',
    ].indexOf(strCPF) !== -1)
      return false

    for (var i = 1; i <= 9; i++)
      Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);

    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11))
      Resto = 0

    if (Resto != parseInt(strCPF.substring(9, 10)))
      return false

    Soma = 0

    for (i = 1; i <= 10; i++)
      Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i)

    Resto = (Soma * 10) % 11

    if ((Resto == 10) || (Resto == 11))
      Resto = 0

    if (Resto != parseInt(strCPF.substring(10, 11)))
      return false

    return true
  }
}