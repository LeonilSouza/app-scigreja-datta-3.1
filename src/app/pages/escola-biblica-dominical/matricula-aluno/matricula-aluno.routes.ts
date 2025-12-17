import { Routes } from '@angular/router';
import { MatriculaAlunoListComponent } from './matricula-aluno-list-form/matricula-aluno-list-form.component';


export const MATRICULA_ALUNO_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: MatriculaAlunoListComponent,
        data: {
          title: 'Matricula Alunos',
          path: 'matriculaalunos'
        },
      },
      {
        path: 'new',
        component: MatriculaAlunoListComponent,
        data: {
          title: 'Matricula Alunos',
          path: 'matriculaalunos'
        },
      },
      {
        path: ':id/edit',
        component: MatriculaAlunoListComponent,
        data: {
          title: 'Matricula Alunos',
          path: 'matriculaalunos'
        },
      },
    ],
  },
];
