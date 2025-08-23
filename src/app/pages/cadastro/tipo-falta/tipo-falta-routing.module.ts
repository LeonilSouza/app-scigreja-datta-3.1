
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TipoFaltaFormComponent } from './tipo-falta-form/tipo-falta-form.component';
import { TipoFaltaListComponent } from './tipo-falta-list/tipo-falta-list.component';

const routes: Routes = [
  {
    path: '',
    component: TipoFaltaListComponent,
    data: {
      title: 'TipoFaltas'
    }
  },

  {
    path: 'new',
    component: TipoFaltaFormComponent,
    data: {
      title: 'TipoFaltas'
    }
  },

  {
    path: ':id/edit',
    component: TipoFaltaFormComponent,
    data: {
      title: 'TipoFaltas'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TipoFaltaRoutingModule { }
