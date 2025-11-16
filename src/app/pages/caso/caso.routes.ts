import { Routes } from '@angular/router';
import { CasoFormComponent } from './caso-form/caso-form.component';
import { CasoListComponent } from './caso-list/caso-list.component';

export const CASO_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CasoListComponent,
        data: {
          title: 'Casos',
          path: 'casos',
        },
      },
      {
        path: 'new',
        component: CasoFormComponent,
        data: {
          title: 'Casos',
          path: 'casos',
        },
      },
      {
        path: ':id/edit',
        component: CasoFormComponent,
        data: {
          title: 'Casos',
          path: 'casos',
        },
      },
    ],
  },
];

