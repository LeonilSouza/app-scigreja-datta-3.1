import { Routes } from '@angular/router';
import { LancamentoEbdListFormComponent } from './lancamento-ebd-list-form.component';

export const LANCAMENTO_EBD_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: LancamentoEbdListFormComponent,
        data: {
          title: 'Lancamentos EBD',
          path: 'lancamentoebds'
        },
      },
      {
        path: 'new',
        component: LancamentoEbdListFormComponent,
        data: {
          title: 'Lancamentos EBD',
          path: 'lancamentoebds'
        },
      },
      {
        path: ':id/edit',
        component: LancamentoEbdListFormComponent,
        data: {
          title: 'Lancamentos EBD',
          path: 'diarioclasses'
        },
      },
    ],
  },
];
