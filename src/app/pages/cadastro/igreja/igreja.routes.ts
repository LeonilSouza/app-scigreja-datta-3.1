import { Routes } from '@angular/router';
import { IgrejaAtivaComponent } from './igreja-ativa/igreja-ativa.component';
import { IgrejaFormComponent } from './igreja-form/igreja-form.component';
import { IgrejaListComponent } from './igreja-list/igreja-list.component';

export const IGREJA_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: IgrejaListComponent,
        data: {
          title: 'Igreja',
          path: 'igrejas'
        }
      },

      {
        path: 'ativa',
        component: IgrejaAtivaComponent,
        data: {
          title: 'Igreja Ativa',
          path: 'igrejas'
        }
      },

      {
        path: 'new',
        component: IgrejaFormComponent,
        data: {
          title: 'Igreja',
          path: 'igrejas'
        }
      },

      {
        path: ':id/edit',
        component: IgrejaFormComponent,
        data: {
          title: 'Igreja',
          path: 'igrejas'
        },
      },
    ],
  },
];