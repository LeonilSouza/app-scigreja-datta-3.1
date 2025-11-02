import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CartaFormComponent } from './carta-form/carta-form.component';
import { CartaListComponent } from './carta-list/carta-list.component';


export const CARTA_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: CartaListComponent,
        data: {
          title: '',
          path: 'cartas',
        },
      },
      {
        path: 'new',
        component: CartaFormComponent,
        data: {
          title: 'Cartas',
          path: 'cartas',
        },
      },
      {
        path: ':id/edit',
        component: CartaFormComponent,
        data: {
          title: 'Cartas',
          path: 'cartas',
        },
      },
    ],
  },
];
