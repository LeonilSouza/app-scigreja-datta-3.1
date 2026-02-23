import { Routes } from '@angular/router';
import { LancamentoCargoListFormComponent } from './lancamento-cargo-list-form/lancamento-cargo-list-form.component';
export const  LANCAMENTO_CARGO_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: LancamentoCargoListFormComponent,
        data: {
          title: 'Frequencias EBD',
          path: 'frequencias'
        },
      },
      {
        path: 'new',
        component: LancamentoCargoListFormComponent,
        data: {
          title: 'Frequencias EBD',
          path: 'frequencias'
        },
      },
      {
        path: ':id/edit',
        component: LancamentoCargoListFormComponent,
        data: {
          title: 'Frequencias EBD',
          path: 'diarioclasses'
        },
      },
    ],
  },
];
