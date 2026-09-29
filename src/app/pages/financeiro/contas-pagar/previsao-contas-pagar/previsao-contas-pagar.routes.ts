
import { Routes } from '@angular/router';
import { PrevisaoFinanceiraComponent } from './previsao-financeira.component';


export const PREVISAO_CP_ROUTES: Routes = [
  {
    path: '',
    component: PrevisaoFinanceiraComponent,
    data: {
      title: 'Previsão de Contas a Pagar',
      path: 'previsao-cp',
    }
  },
];
