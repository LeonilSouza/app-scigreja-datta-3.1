import { Routes } from '@angular/router';
import { AlunoListComponent } from './aluno-list-form/aluno-list-form.component';

export const ALUNO_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: AlunoListComponent,
        data: {
          title: 'Matricula Alunos',
          path: 'alunos'
        },
      },
      {
        path: 'new',
        component: AlunoListComponent,
        data: {
          title: 'Matricula Alunos',
          path: 'alunos'
        },
      },
      {
        path: ':id/edit',
        component: AlunoListComponent,
        data: {
          title: 'Matricula Alunos',
          path: 'alunos'
        },
      },
    ],
  },
];
