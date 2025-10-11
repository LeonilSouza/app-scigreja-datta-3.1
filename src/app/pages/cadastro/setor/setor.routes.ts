import { Routes } from '@angular/router';
import { SetorListComponent } from './setor-list/setor-list.component';
import { SetorFormComponent } from './setor-form/setor-form.component';

export const SETOR_ROUTES: Routes = [
  {
    path: '',
       children: [
         {
           path: '',
           component: SetorListComponent,
           data: {
             title: 'Setores',
             path: 'setores'
           },
         },
         {
           path: 'new',
           component: SetorFormComponent,
           data: {
             title: 'Setores',
             path: 'setores'
           },
         },
         {
           path: ':id/edit',
           component: SetorFormComponent,
           data: {
             title: 'Setores',
             path: 'setores'
           },
         },
       ],
     },
   ];
   
