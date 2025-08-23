import { DepartamentoListComponent } from './departamento-list/departamento-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DepartamentoFormComponent } from './departamento-form/departamento-form.component';

const routes: Routes = [
  {
    path: '',
    component: DepartamentoListComponent,
    data: {
      title: 'Departamentos'
    }
  },

  {
    path: 'new',
    component: DepartamentoFormComponent,
    data: {
      title: 'Departamentos'
    }
  },

  {
    path: ':id/edit',
    component: DepartamentoFormComponent,
    data: {
      title: 'Departamentos'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DepartamentoRoutingModule { }
