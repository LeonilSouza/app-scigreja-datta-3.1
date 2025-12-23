import { Routes } from '@angular/router';
import { ProfessorListComponent } from './professor-list-form/professor-list-form.component';

export const PROFESSOR_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ProfessorListComponent,
        data: {
          title: 'Matricula Professores',
          path: 'professores'
        },
      },
      {
        path: 'new',
        component: ProfessorListComponent,
        data: {
          title: 'Matricula Professores',
          path: 'professores'
        },
      },
      {
        path: ':id/edit',
        component: ProfessorListComponent,
        data: {
          title: 'Matricula Professores',
          path: 'professores'
        },
      },
    ],
  },
];
