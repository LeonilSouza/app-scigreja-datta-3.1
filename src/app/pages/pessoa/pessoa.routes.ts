import { Routes } from '@angular/router';


export const PESSOA_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('../pessoa/pessoa-list/pessoa-list.component').then((p) => p.PessoaListComponent), 
        data: {
          title: 'Membros',
          path: 'pessoas'
        }
      },
      {
        path: 'new',
        loadComponent: () => import('../pessoa/pessoa-form/pessoa-form.component').then((p) => p.PessoaFormComponent),
        data: {
          title: 'Membros',
          path: 'pessoas'
        }
      },
      {
        path: ':id/edit',
        loadComponent: () => import('../pessoa/pessoa-form/pessoa-form.component').then((p) => p.PessoaFormComponent),  
        data: {
          title: 'Membros',
          path: 'pessoas'
        }
      }
    ]
  }
];