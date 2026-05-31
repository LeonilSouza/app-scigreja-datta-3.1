import { Routes } from '@angular/router';
import { LancamentoCargoListFormComponent } from './lancamento-cargo-list-form/lancamento-cargo-depto-list-form.component';
export const  LANCAMENTO_CARGO_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: LancamentoCargoListFormComponent,
        data: {
          title: 'Cargos departamentais',
          path: 'cargos-deptos'
        },
      },
      {
        path: 'new',
        component: LancamentoCargoListFormComponent,
        data: {
          title: 'Cargos departamentais',
          path: 'cargos-deptos'
        },
      },
      {
        path: ':id/edit',
        component: LancamentoCargoListFormComponent,
        data: {
          title: 'Cargos departamentais',
          path: 'cargos-deptos'
        },
      },
    ],
  },
];
