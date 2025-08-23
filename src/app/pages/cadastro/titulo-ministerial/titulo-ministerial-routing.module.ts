import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TituloMinisterialFormComponent } from './titulo-ministerial-form/titulo-ministerial-form.component';
import { TituloMinisterialListComponent } from './titulo-ministerial-list/titulo-ministerial-list.component';

const routes: Routes = [
  {
    path: '',
    component: TituloMinisterialListComponent,
    data: {
      title: 'Titulo Ministerial '
    }
  },

  {
    path: 'new',
    component: TituloMinisterialFormComponent,
    data: {
      title: 'Titulo Ministerial  '
    }
  },

  {
    path: ':id/edit',
    component: TituloMinisterialFormComponent,
    data: {
      title: 'Titulo Ministerial   '
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TituloMinisterialRoutingModule { }
