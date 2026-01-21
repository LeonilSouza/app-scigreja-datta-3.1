import { Injectable, signal, WritableSignal } from "@angular/core";

import moment from 'moment';

@Injectable({
  providedIn: 'root'
})

export class SharedService {

  private valorCompartilhado = signal(0);

  getValor(): WritableSignal<number> {
    return this.valorCompartilhado;
  }

  atualizarValor(novoValor: number) {
    this.valorCompartilhado.set(novoValor);
  }

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

  anoLetivo() {// 0000
    let data = new Date(),
      dia = data.getDate().toString().padStart(2, '0'),
      mes = (data.getMonth() + 1).toString().padStart(2, '0'),
      ano = data.getFullYear();
    return `${ano}`;

  }

  mesAno() {// 00/0000
    let data = new Date(),
      dia = data.getDate().toString().padStart(2, '0'),
      mes = (data.getMonth() + 1).toString().padStart(2, '0'),
      ano = data.getFullYear();
    return `${mes}/${ano}`;
  }

  anoDataString(dataString) { // Retorna ano da data passada
    const dataBRString = dataString;
    const partes = dataBRString.split('/'); // ["15", "08", "2024"]

    // Reorganiza para YYYY/MM/DD/
    const dataUSString = `${partes[2]}-${partes[1]}-${partes[0]}`;
    // console.log(dataUSString); // Saída: 2024-12-25

    // const dia = `${partes[0]}`;
    const ano: string = (`${partes[2]}`);
    // console.log(mesAno)
    return ano;
  }

  // Função auxiliar para formatar a data como YYYY-MM-DD
  formatarDataUSString(dataBR) { // Recebe dd/mm/yyyy (Brasileira) e retorna yyyy-mm-dd (Americana)
    const partes = dataBR.split('/'); // ["15", "08", "2024"]

    // Reorganiza para YYYY/MM/DD/
    const dataUSString = `${partes[2]}-${partes[1]}-${partes[0]}`;

    return dataUSString;
  }


  retornaTrimestre(dataString) { // Retorna trimestre do ano passado
    const dataBRString = dataString;
    const partes = dataBRString.split('/'); // ["15", "08", "2024"]

    // Reorganiza para YYYY/MM/DD/
    const dataUSString = `${partes[2]}-${partes[1]}-${partes[0]}`;
    // console.log(dataUSString); // Saída: 2024-12-25

    // const dia = `${partes[0]}`;
    const mes = +(`${partes[1]}`); //Mes 
    // const ano = `${partes[2]}`;

    let trimestre = 0;
    mes >= 1 && mes <= 3 ? trimestre = 1 :
      mes >= 4 && mes <= 6 ? trimestre = 2 :
        mes >= 7 && mes <= 9 ? trimestre = 3 :
          mes >= 10 && mes <= 12 ? trimestre = 4 : ''
    return trimestre;
  }

  calcularLimitesTrimestre(dataRef: Date) {
    const ano = dataRef.getFullYear();
    // Identifica o trimestre (0 a 3)
    const trimestreAtual = Math.floor(dataRef.getMonth() / 3);

    // Primeiro mês do trimestre (0, 3, 6 ou 9)
    const mesInicial = trimestreAtual * 3;

    // Primeiro dia do primeiro mês
    const primeiroDia = new Date(ano, mesInicial, 1);

    // Último dia do trimestre: 
    // Criamos o primeiro dia do PRÓXIMO trimestre (mesInicial + 3) 
    // e definimos o dia como '0' para pegar o último dia do mês anterior.
    const ultimoDia = new Date(ano, mesInicial + 3, 0);

    return {
      inicio: primeiroDia.toLocaleDateString(),
      fim: ultimoDia.toLocaleDateString()
    };
  }

  retornaMes(dataString) { // Retorna Mes da data passada
    const dataBRString = dataString;
    const partes = dataBRString.split('/'); // ["15", "08", "2024"]

    // Reorganiza para YYYY/MM/DD/
    const dataUSString = `${partes[2]}-${partes[1]}-${partes[0]}`;
    // console.log(dataUSString); // Saída: 2024-12-25

    // const dia = `${partes[0]}`;
    const mes = +(`${partes[1]}`);
    // const ano = `${partes[2]}`;

    return mes;
  }

  retornaAno(dataString) { // Retorna o Ano da data passada
    const dataBRString = dataString;
    const partes = dataBRString.split('/'); // ["15", "08", "2024"]

    // Reorganiza para YYYY/MM/DD/
    const dataUSString = `${partes[2]}-${partes[1]}-${partes[0]}`;
    // console.log(dataUSString); // Saída: 2024-12-25

    // const dia = `${partes[0]}`;
    // const mes = +(`${partes[1]}`);
    const ano = `${partes[2]}`;

    return ano;
  }

  retornaDia(dataString) { // Retorna Dia da data passada
    const dataBRString = dataString;
    const partes = dataBRString.split('/'); // ["15", "08", "2024"]

    // Reorganiza para YYYY/MM/DD/
    const dataUSString = `${partes[2]}-${partes[1]}-${partes[0]}`;
    // console.log(dataUSString); // Saída: 2024-12-25

    const dia = `${partes[0]}`;
    // const mes = +(`${partes[1]}`);
    // const ano = `${partes[2]}`;

    return dia;
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

  // Pesquisa Estados
  getDataEstados(): any {
    let url: string = `https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome`;
    return fetch(url)
      .then(this.handleErrors);
  }

  getDataEstado(id): any {
    let url: string = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${id}`;
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