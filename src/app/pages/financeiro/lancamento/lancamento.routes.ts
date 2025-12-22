
import { Routes } from '@angular/router';
import { LancamentoListFormComponent } from './lancamento-list-form/lancamento-list-form.component';


export const LANCAMENTO_ROUTES: Routes = [
  {
    path: '',
    component: LancamentoListFormComponent,
    data: {
     title: 'Extratos | Lançamentos'
    }
  }
];
