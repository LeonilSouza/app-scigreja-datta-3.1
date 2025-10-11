import { Routes } from '@angular/router';
import { TituloMinisterialFormComponent } from './titulo-ministerial-form/titulo-ministerial-form.component';
import { TituloMinisterialListComponent } from './titulo-ministerial-list/titulo-ministerial-list.component';

export const TITULO_MINISTERIAL_ROUTES: Routes = [
  {
    path: '',
       children: [
         {
           path: '',
           component: TituloMinisterialListComponent,
           data: {
             title: 'Titulos',
             path: 'titulos'
           },
         },
         {
           path: 'new',
           component: TituloMinisterialFormComponent,
           data: {
             title: 'Titulos',
             path: 'titulos'
           },
         },
         {
           path: ':id/edit',
           component: TituloMinisterialFormComponent,
           data: {
             title: 'Titulos',
             path: 'titulos'
           },
         },
       ],
     },
   ];
   
