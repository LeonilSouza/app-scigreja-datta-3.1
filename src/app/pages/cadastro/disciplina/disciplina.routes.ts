import { Routes } from '@angular/router';

export const DISCIPLINA_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('../disciplina/disciplina-list/disciplina-list.component').then((dl) => dl.DisciplinaListComponent),
        data: {
          title: 'Disciplinas'
        }
      },
      {
        path: 'new',
        loadComponent: () => import('../disciplina/disciplina-form/disciplina-form.component').then((df) => df.DisciplinaFormComponent),
        data: {
          title: 'Disciplinas'
        }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('../disciplina/disciplina-form/disciplina-form.component').then((df) => df.DisciplinaFormComponent),
        data: {
          title: 'Disciplinas'
        }
      }
    ]
  }
];