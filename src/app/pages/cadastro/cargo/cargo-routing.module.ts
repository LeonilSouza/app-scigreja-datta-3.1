import { CargoListComponent } from './cargo-list/cargo-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CargoFormComponent } from './cargo-form/cargo-form.component';

const routes: Routes = [
  {
    path: '',
    component: CargoListComponent,
    data: {
      title: 'Cargos'
    }
  },

  {
    path: 'new',
    component: CargoFormComponent,
    data: {
      title: 'Cargos'
    }
  },

  {
    path: ':id/edit',
    component: CargoFormComponent,
    data: {
      title: 'Cargos'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CargoFuncaoRoutingModule { }
