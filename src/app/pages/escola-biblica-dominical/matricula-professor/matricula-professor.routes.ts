import { Routes } from '@angular/router';
import { MatriculaProfessorListComponent } from './matricula-professor-list-form/matricula-professor-list-form.component';

export const MATRICULA_PROFESSOR_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: MatriculaProfessorListComponent,
        data: {
          title: 'Matricula Professores',
          path: 'matriculaprofessores'
        },
      },
      {
        path: 'new',
        component: MatriculaProfessorListComponent,
        data: {
          title: 'Matricula Professores',
          path: 'matriculaprofessores'
        },
      },
      {
        path: ':id/edit',
        component: MatriculaProfessorListComponent,
        data: {
          title: 'Matricula Professores',
          path: 'matriculaprofessores'
        },
      },
    ],
  },
];
