import { UsuarioListComponent } from './usuario-list/usuario-list.component';
import { Routes } from '@angular/router';
import { UsuarioFormComponent } from './usuario-form/usuario-form.component';
import { AuthGuardChild } from 'src/app/theme/shared/_helpers/auth.guard';

export const USUARIO_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: UsuarioListComponent,
        data: {
          title: 'Usuarios',
          path: 'usuarios'
        }
      },
      {
        path: 'new',
        component: UsuarioFormComponent, 
        data: {
          title: 'Usuarios',
          path: 'usuarios'
        }
      },

      {
        path: ':id/edit',
        component: UsuarioFormComponent, 
        data: {
          title: 'Usuarios',
          path: 'usuarios'
        },
      },
    ],
  },
];
