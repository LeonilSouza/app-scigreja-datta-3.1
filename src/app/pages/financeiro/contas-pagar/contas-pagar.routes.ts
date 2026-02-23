
import { Routes } from '@angular/router';
import { ContasPagarListFormComponent } from './contas-pagar-list-form/contas-pagar-list-form.component';


export const CONTAS_PAGAR_ROUTES: Routes = [
  {
    path: '',
    component: ContasPagarListFormComponent,
    data: {
     title: 'Contas a Pagar',
     path: 'contas-pagar'
    }
  }
];
