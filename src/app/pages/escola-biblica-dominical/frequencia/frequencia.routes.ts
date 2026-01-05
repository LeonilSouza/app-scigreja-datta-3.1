import { Routes } from '@angular/router';
import { FrequenciaListFormComponent } from './frequencia-list-form.component';

export const  FREQUENCIA_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: FrequenciaListFormComponent,
        data: {
          title: 'Frequencias EBD',
          path: 'frequencias'
        },
      },
      {
        path: 'new',
        component: FrequenciaListFormComponent,
        data: {
          title: 'Frequencias EBD',
          path: 'frequencias'
        },
      },
      {
        path: ':id/edit',
        component: FrequenciaListFormComponent,
        data: {
          title: 'Frequencias EBD',
          path: 'diarioclasses'
        },
      },
    ],
  },
];
