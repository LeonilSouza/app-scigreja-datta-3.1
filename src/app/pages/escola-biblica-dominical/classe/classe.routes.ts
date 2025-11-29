import { Routes } from '@angular/router';
import { ClasseListComponent } from './classe-list/classe-list.component';

export const CLASSE_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ClasseListComponent,
        data: {
          title: 'Classes',
          path: 'classes'
        },
      },
      {
        path: 'new',
        component: ClasseListComponent,
        data: {
          title: 'Classes',
          path: 'classes'
        },
      },
      {
        path: ':id/edit',
        component: ClasseListComponent,
        data: {
          title: 'Classes',
          path: 'classes'
        },
      },
    ],
  },
];
