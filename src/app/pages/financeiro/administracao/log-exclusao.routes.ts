
import { Routes } from '@angular/router';
import { LogExclusaoComponent } from './auditoria-finance/log-exclusao.component';


export const AUDITORIA_ROUTES: Routes = [
  {
    path: '',
    component: LogExclusaoComponent,
    data: {
      title: 'Auditoria Financeira'
    }
  },
  {
    path: 'auditoria-caixa',
    component: LogExclusaoComponent,
    data: {
      title: 'Auditoria Financeira',
      path: 'auditoria-caixa',
    },
  },
];
