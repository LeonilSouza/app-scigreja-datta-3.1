import { Routes } from '@angular/router';
import { DisciplinaListComponent } from './disciplina-list/disciplina-list.component';
import { DisciplinaFormComponent } from '../disciplina/disciplina-form/disciplina-form.component';

export const DISCIPLINA_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: DisciplinaListComponent,
        data: {
          title: 'Disciplinas',
        },
      },
      {
        path: 'new',
        component: DisciplinaFormComponent,
        data: {
          title: 'Disciplinas',
        },
      },
      {
        path: ':id/edit',
        component: DisciplinaFormComponent,
        data: {
          title: 'Disciplinas',
        },
      },
    ],
  },
];
