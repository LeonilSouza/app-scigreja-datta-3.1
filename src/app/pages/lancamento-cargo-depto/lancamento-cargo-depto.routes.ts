import { Routes } from '@angular/router';import { LancamentoCargoDeptoFormComponent } from './lancamento-cargo-depto-form/lancamento-cargo-depto-form.component';
import { LancamentoCargoDeptoListComponent } from './lancamento-cargo-depto-list/lancamento-cargo-depto-list.component';

export const LANCAMENTO_CARGO_DEPTO_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: LancamentoCargoDeptoListComponent,
        data: {
          title: 'Lançamento Cargos Departamentais',
          path: 'lancamentocargodeptos',
        },
      },
      {
        path: 'new',
        component: LancamentoCargoDeptoFormComponent,
        data: {
          title: 'Lançamento Cargos Departamentais',
          path: 'lancamentocargodeptos',
        },
      },
      {
        path: ':id/edit',
        component: LancamentoCargoDeptoFormComponent,
        data: {
          title: 'Lançamento Cargos Departamentais',
          path: 'lancamentocargodeptos',
        },
      },
    ],
  },
];
