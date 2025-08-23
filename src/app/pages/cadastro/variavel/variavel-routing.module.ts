import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VariavelFormComponent } from './variavel-form/variavel-form.component';
import { VariavelListComponent } from './variavel-list/variavel-list.component';

const routes: Routes = [
  {
    path: '',
    component: VariavelListComponent,
    data: {
      title: 'Variável'
    }
  },

  {
    path: 'new',
    component: VariavelFormComponent,
    data: {
      title: 'Variável'
    }
  },

  {
    path: ':id/edit',
    component: VariavelFormComponent,
    data: {
      title: 'Variável'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VariavelRoutingModule { }
