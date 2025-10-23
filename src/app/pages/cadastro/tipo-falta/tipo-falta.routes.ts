
import { Routes } from '@angular/router';
import { TipoFaltaFormComponent } from './tipo-falta-form/tipo-falta-form.component';
import { TipoFaltaListComponent } from './tipo-falta-list/tipo-falta-list.component';

export const TIPO_FALTA_ROUTES: Routes = [
  {
    path: '',
       children: [
         {
           path: '',
           component: TipoFaltaListComponent,
           data: {
             title: 'Tipo de Falta',
             path: 'tipofaltas'
           },
         },
         {
           path: 'new',
           component: TipoFaltaFormComponent,
           data: {
             title: 'Tipo de Falta',
             path: 'tipofaltas'
           },
         },
         {
           path: ':id/edit',
           component: TipoFaltaFormComponent,
           data: {
             title: 'Tipo de Falta',
             path: 'tipofaltas'
           },
         },
       ],
     },
   ];
   
