import { Routes } from '@angular/router';
import { PessoaListComponent } from './pessoa-list/pessoa-list.component';
import { PessoaFormComponent } from '../pessoa/pessoa-form/pessoa-form.component';

export const PESSOA_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: PessoaListComponent,
        data: {
          title: 'Membros',
          path: 'pessoas',
        },
      },
      {
        path: 'new',
        component: PessoaFormComponent,
        data: {
          title: 'Membros',
          path: 'pessoas',
        },
      },
      {
        path: ':id/edit',
        component: PessoaFormComponent,
        data: {
          title: 'Membros',
          path: 'pessoas',
        },
      },
    ],
  },
];
