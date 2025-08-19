// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// project import
import { Role } from 'src/app/theme/shared/_helpers/role';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'signin-v2',
        loadComponent: () => import('./auth-signin-v2/auth-signin-v2.component').then((c) => c.AuthSigninV2Component),
        
      },
      {
        path: 'signin-v5',
        loadComponent: () => import('./auth-signin-v5/auth-signin-v5.component').then((c) => c.AuthSigninV5Component),
        
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule {}
