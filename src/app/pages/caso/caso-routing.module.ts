import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CasoFormComponent } from './caso-form/caso-form.component';
import { CasoListComponent } from './caso-list/caso-list.component';


const routes: Routes = [
  {
    path: '',
    component: CasoListComponent,
    data: {
      title: 'Casos'
    }
  },

  {
    path: 'new',
    component: CasoFormComponent,
    data: {
      title: 'Casos '
    }
  },

  {
    path: ':id/edit',
    component: CasoFormComponent,
    data: {
      title: 'Casos '
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CasoRoutingModule {}
