import { Component, OnInit } from '@angular/core';
import { LancamentoService } from 'src/app/theme/shared/services/lancamento.service';
import { ChartModule } from 'primeng/chart';
import { igrejaIdSignal, setorIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { DatePicker } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dashboard-finance',
  templateUrl: './dashboard-finance.component.html',
  styleUrls: ['./dashboard-finance.component.css'],
  standalone: true,
  imports: [
    ChartModule,
    DatePicker,
    ButtonModule,
    SharedModule,
  ],
  providers: [
  ]
})
export class DashboardFinanceComponent implements OnInit {

  // Gráfico 1: Barras (Faturamento Mensal)
  dataBarras: any;
  optionsBarras: any;
  dataRosca: any;
  optionsRosca: any;
  
  igrejaId = igrejaIdSignal();
  setorId = setorIdSignal();

  // Gráfico 2: Rosca (Gastos por Categorias)

   // Objetos Date nativos para o p-calendar do PrimeNG
  dataInicial!: Date;
  dataFinal!: Date;

  // Tradução do calendário para Português (PrimeNG padrão)
  ptBr: any;


  // Filtro base que herda o contexto da tela
  filtro = {
    igrejaId: this.setorId, // Substitua pelo ID real da sessão do usuário
    setorId: this.setorId,
    dtinicio: '01/05/2026', // Exemplo de período mensal cheio
    dtfim: '30/05/2026'
  };

  constructor(private lancamentoService: LancamentoService) { }

   ngOnInit(): void {
    this.inicializarPeriodo();
    this.configurarOpcoesGraficos();
    this.atualizarDashboard();
  }

  inicializarPeriodo() {
    const hoje = new Date();
    // Força o primeiro dia do mês atual (ex: 01/05/2026)
    this.dataInicial = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    // Força o último dia do mês atual (ex: 31/05/2026)
    this.dataFinal = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    // Configuração de tradução para o componente PrimeNG antiga (se necessária)
    this.ptBr = {
      firstDayOfWeek: 0,
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
      monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      today: 'Hoje',
      clear: 'Limpar'
    };
  }

  // Método central que formata as datas e dispara as requisições em paralelo
  atualizarDashboard() {
    const filtroFormatado = {
      igrejaId: this.igrejaId,
      setorId: this.setorId,
      dtinicio: this.formatarData(this.dataInicial),
      dtfim: this.formatarData(this.dataFinal)
    };

    this.carregarGraficoBarras(filtroFormatado);
    this.carregarGraficoRosca(filtroFormatado);
  }

  // Auxiliar para converter o objeto Date em string "dd/MM/yyyy" exigida pelo Java
  private formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  carregarGraficoBarras(filtro: any) {
    this.lancamentoService.buscarFaturamentoMensal(filtro.igrejaId, filtro.setorId).subscribe({
      next: (dados) => {
        this.dataBarras = {
          labels: dados.map(item => item.mes),
          datasets: [
            { label: 'Receitas', backgroundColor: '#22c55e', data: dados.map(item => item.receitas) },
            { label: 'Despesas', backgroundColor: '#ef4444', data: dados.map(item => item.despesas) }
          ]
        };
      }
    });
  }

  carregarGraficoRosca(filtro: any) {
    this.lancamentoService.buscarGastosPorCategoria(filtro).subscribe({
      next: (dados) => {
        const cores = this.gerarPaletaCores(dados.length);
        this.dataRosca = {
          labels: dados.map(item => item.categoria),
          datasets: [{ data: dados.map(item => item.total), backgroundColor: cores, hoverBackgroundColor: cores }]
        };
      }
    });
  }

  gerarPaletaCores(quantidade: number): string[] {
    const cores: string[] = [];
    for (let i = 0; i < quantidade; i++) {
      const tom = (i * (360 / quantidade)) % 360;
      cores.push(`hsl(${tom}, 70%, 60%)`);
    }
    return cores;
  }

  configurarOpcoesGraficos() {
    this.optionsBarras = { plugins: { legend: { labels: { color: '#495057' } } } };
    this.optionsRosca = { plugins: { legend: { position: 'right', labels: { color: '#495057', boxWidth: 15 } } }, cutout: '60%' };
  }
}