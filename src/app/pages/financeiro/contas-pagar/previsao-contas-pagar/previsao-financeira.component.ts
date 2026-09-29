import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { ChartModule } from 'primeng/chart';
import { igrejaIdSignal } from 'src/app/theme/shared/_helpers/shared-signals';
import { PrevisaoFinanceira, PrevisaoPorMes } from 'src/app/theme/shared/models/previsao-financeira.dto';
import { ContasPagarService } from 'src/app/theme/shared/services/contas-pagar.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-previsao-financeira',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    DatePicker,
    ChartModule
  ],
  providers: [
      ContasPagarService
    ],
  templateUrl: './previsao-financeira.component.html',
  styleUrls: ['./previsao-financeira.component.scss']
})
export class PrevisaoFinanceiraComponent implements OnInit {

  igrejaId = igrejaIdSignal();

  dataInicioDate: Date | null = null;
  dataFimDate: Date | null = null;

  previsao: PrevisaoFinanceira | null = null;
  carregando: boolean = false;
  mesExpandido: string | null = null;

  // Gráfico PrimeNG
  dadosGrafico: any = null;
  opcoesGrafico: any = null;

  constructor(private contasPagarService: ContasPagarService) {}

 ngOnInit(): void {
  const hoje = new Date();
  this.dataInicioDate = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  this.dataFimDate = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  this.buscar(); // ← adiciona essa linha
}


  buscar(): void {
    if (!this.dataInicioDate || !this.dataFimDate) return;

    const dataInicio = this.formatarDataParaApi(this.dataInicioDate);
    const dataFim = this.formatarDataParaApi(this.dataFimDate);

    this.carregando = true;
    this.previsao = null;

    this.contasPagarService.getPrevisaoFinanceira(
      this.igrejaId, dataInicio, dataFim
    ).subscribe({
      next: (dados) => {
        this.previsao = dados;
        this.montarGrafico(dados.porMes);
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  montarGrafico(porMes: PrevisaoPorMes[]): void {
    const labels = porMes.map(m => m.mesAno);

    this.dadosGrafico = {
      labels,
      datasets: [
        {
          label: 'Previsto',
          data: porMes.map(m => m.totalPrevisto),
          backgroundColor: '#3B82F6'
        },
        {
          label: 'Pago',
          data: porMes.map(m => m.totalPago),
          backgroundColor: '#22C55E'
        },
        {
          label: 'Pendente',
          data: porMes.map(m => m.totalPendente),
          backgroundColor: '#F59E0B'
        },
        {
          label: 'Atrasado',
          data: porMes.map(m => m.totalAtrasado),
          backgroundColor: '#EF4444'
        }
      ]
    };

    this.opcoesGrafico = {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (ctx: any) =>
              ` ${ctx.dataset.label}: ${ctx.raw.toLocaleString('pt-BR', {
                style: 'currency', currency: 'BRL'
              })}`
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: (value: number) =>
              value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          }
        }
      }
    };
  }

  toggleMes(mesAno: string): void {
    this.mesExpandido = this.mesExpandido === mesAno ? null : mesAno;
  }

  get alertaPercentual(): string {
    if (!this.previsao) return '';
    const p = Number(this.previsao.percentualGasto);
    if (p >= 90) return 'danger';
    if (p >= 70) return 'warning';
    return 'success';
  }

  get alertaMensagem(): string {
    if (!this.previsao) return '';
    const p = Number(this.previsao.percentualGasto);
    if (p >= 90) return `⚠️ ATENÇÃO! ${p}% do orçamento já foi comprometido!`;
    if (p >= 70) return `🔶 Cuidado! ${p}% do orçamento já foi comprometido.`;
    return `✅ ${p}% do orçamento comprometido. Situação sob controle.`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PAGO':      return 'badge bg-success';
      case 'PENDENTE':  return 'badge bg-warning text-dark';
      case 'ATRASADO':  return 'badge bg-danger';
      case 'CANCELADO': return 'badge bg-secondary';
      default:          return 'badge bg-light';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PAGO':      return 'Pago';
      case 'PENDENTE':  return 'Pendente';
      case 'ATRASADO':  return 'Atrasado';
      case 'CANCELADO': return 'Cancelado';
      default:          return status;
    }
  }

  formatarDataParaApi(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`; // ← dd/MM/yyyy
}


  formatarMoeda(valor: number): string {
    return valor?.toLocaleString('pt-BR', {
      style: 'currency', currency: 'BRL'
    }) ?? 'R$ 0,00';
  }
}
