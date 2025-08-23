import { SetorListComponent } from './setor-list/setor-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SetorFormComponent } from './setor-form/setor-form.component';
import { AuthGuard } from 'src/app/_helpers';

const routes: Routes = [
  {
    path: '',
    component: SetorListComponent, canActivate: [ AuthGuard],
    data: {
      title: 'Setores'
    }
  },

  {
    path: 'new',
    component: SetorFormComponent, canActivate: [AuthGuard],
    data: {
      title: 'Setores'
    }
  },
  
  {
    path: ':id/edit',
    component: SetorFormComponent, canActivate: [AuthGuard],
    data: {
      title: 'Setores' 
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetorRoutingModule { }
