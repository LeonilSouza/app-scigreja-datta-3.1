
import { Routes } from '@angular/router';
import { LancamentoListFormComponent } from './lancamento-list-form/lancamento-list-form.component';
import { DashboardFinanceComponent } from './dashboard-finance/dashboard-finance.component';


export const LANCAMENTO_ROUTES: Routes = [
  {
    path: '',
    component: LancamentoListFormComponent,
    data: {
      title: 'Extratos | Lançamentos'
    }
  },
  {
    path: 'dashboard-finance',
    component: DashboardFinanceComponent,
    data: {
      title: 'Dashboard',
      path: 'faturamento-mensal',
    },
  },
];
