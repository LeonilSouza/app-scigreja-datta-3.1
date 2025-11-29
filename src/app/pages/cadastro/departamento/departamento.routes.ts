import { Routes } from '@angular/router';
import { DepartamentoListComponent } from './departamento-list/departamento-list.component';
import { DepartamentoFormComponent } from './departamento-form/departamento-form.component';

export const DEPARTAMENTO_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: DepartamentoListComponent,
        data: {
          title: 'Departamentos',
          path: 'departamentos'
        },
      },
      {
        path: 'new',
        component: DepartamentoFormComponent,
        data: {
          title: 'Departamentos',
          path: 'departamentos'
        },
      },
      {
        path: ':id/edit',
        component: DepartamentoFormComponent,
        data: {
          title: 'Departamentos',
          path: 'departamentos'
        },
      },
    ],
  },
];
