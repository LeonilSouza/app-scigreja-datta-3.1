import { Routes } from '@angular/router';
import { CargoDepartamentoListComponent } from './cargo-departamento-list/cargo-departamento-list.component';
import { CargoDepartamentoFormComponent } from './cargo-departamento/cargo-departamento-form.component';

export const CARGO_DEPARTAMENTO_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CargoDepartamentoListComponent,
        data: {
          title: 'Cargos Departamentos',
          path: 'cargodeptos',
        },
      },
      {
        path: 'new',
        component: CargoDepartamentoFormComponent,
        data: {
          title: 'Cargos Departamentos',
          path: 'cargodeptos',
        },
      },
      {
        path: ':id/edit',
        component: CargoDepartamentoFormComponent,
        data: {
          title: 'Cargos Departamentos',
          path: 'cargodeptos',
        },
      },
    ],
  },
];
