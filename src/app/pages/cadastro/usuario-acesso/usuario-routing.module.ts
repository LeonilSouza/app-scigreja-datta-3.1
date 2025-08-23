import { UsuarioListComponent } from './usuario-list/usuario-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsuarioFormComponent } from './usuario-form/usuario-form.component';
import { AuthGuard } from 'src/app/_helpers';

const routes: Routes = [
  {
    path: '',
    component: UsuarioListComponent, canActivate: [AuthGuard],
    data: {
      title: 'Usuarios'
    }
  },

  {
    path: 'new',
    component: UsuarioFormComponent, canActivate: [AuthGuard],
    data: {
      title: 'Usuarios'
    }
  },
  
  {
    path: ':id/edit',
    component: UsuarioFormComponent, canActivate: [AuthGuard],
    data: {
      title: 'Usuarios' 
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuarioRoutingModule { }
