import { CargoListComponent } from './cargo-list/cargo-list.component';
import { Routes } from '@angular/router';
import { CargoFormComponent } from './cargo-form/cargo-form.component';

export const CARGO_ROUTES: Routes = [
 {
     path: '',
     children: [
       {
         path: '',
         component: CargoListComponent,
         data: {
           title: 'Cargos',
         },
       },
       {
         path: 'new',
         component: CargoFormComponent,
         data: {
           title: 'Cargos',
         },
       },
       {
         path: ':id/edit',
         component: CargoFormComponent,
         data: {
           title: 'Cargos',
         },
       },
     ],
   },
 ];
 