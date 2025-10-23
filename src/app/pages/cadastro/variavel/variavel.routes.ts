import { Routes } from '@angular/router';
import { VariavelFormComponent } from './variavel-form/variavel-form.component';
import { VariavelListComponent } from './variavel-list/variavel-list.component';

export const VARIAVEL_ROUTES: Routes = [
  {
    path: '',
       children: [
         {
           path: '',
           component: VariavelListComponent,
           data: {
             title: 'Variaveis',
             path: 'variaveis'
           },
         },
         {
           path: 'new',
           component: VariavelFormComponent,
           data: {
             title: 'Variaveis',
             path: 'variaveis'
           },
         },
         {
           path: ':id/edit',
           component: VariavelFormComponent,
           data: {
             title: 'Variaveis',
             path: 'variaveis'
           },
         },
       ],
     },
   ];
   
