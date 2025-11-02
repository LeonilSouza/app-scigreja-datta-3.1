var currentTime = new Date()
var horas = currentTime.getHours();
var minutos = currentTime.getMinutes();
var segundos = currentTime.getSeconds(); 
var dia = currentTime.getDate(); 
var mes = currentTime.getMonth();
var ano = currentTime.getFullYear();  
var Dia = currentTime.getDay(); 
var Mes = currentTime.getUTCMonth();

if (minutos < 10)
minutos = "0" + minutos
if (segundos < 10)
segundos = "0" + segundos
if (dia < 10)
dia = "0" + dia
if (mes < 10)
mes = "0" + mes

arrayDia = new Array();
   arrayDia[0] = "Domingo";
   arrayDia[1] = "Segunda-Feira";
   arrayDia[2] = "Terça-Feira";
   arrayDia[3] = "Quarta-Feira";
   arrayDia[4] = "Quinta-Feira";
   arrayDia[5] = "Sexta-Feira";
   arrayDia[6] = "Sábado";

var arrayMes = new Array();
   arrayMes[0] = "Janeiro";
   arrayMes[1] = "Fevereiro";
   arrayMes[2] = "Março";      
   arrayMes[3] = "Abril";
   arrayMes[4] = "Maio";
   arrayMes[5] = "Junho";
   arrayMes[6] = "Julho";
   arrayMes[7] = "Agosto";
   arrayMes[8] = "Setembro";
   arrayMes[9] = "Outubro";
   arrayMes[10] = "Novembro";
   arrayMes[11] = "Dezembro";
document.write(arrayDia[Dia] + ", " + dia + " de " + arrayMes[Mes] + " de " + ano);