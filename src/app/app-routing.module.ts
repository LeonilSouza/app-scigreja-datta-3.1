// angular import
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// project import
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { AuthGuardChild } from './theme/shared/_helpers/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivateChild: [AuthGuardChild],
    children: [
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'disciplinas',
        loadChildren: () =>
          import('./pages/cadastro/disciplina/disciplina.routes').then(
            (d) => d.DISCIPLINA_ROUTES
          ),
      },
      {
        path: 'pessoas',
        loadChildren: () =>
          import('./pages/pessoa/pessoa.routes').then((m) => m.PESSOA_ROUTES),
      },
      {
        path: 'layout',
        loadChildren: () =>
          import('./layout/layout.module').then((m) => m.LayoutModule),
      },
      {
        path: 'forms',
        loadChildren: () =>
          import('./pages/form-elements/form-elements.module').then(
            (m) => m.FormElementsModule
          ),
      },
      {
        path: 'layout',
        loadChildren: () =>
          import('./pages/form-layout/form-layout.module').then(
            (m) => m.FormLayoutModule
          ),
      },
      {
        path: 'basic',
        loadChildren: () =>
          import('./pages/ui-elements/ui-basic/ui-basic.module').then(
            (m) => m.UiBasicModule
          ),
      },
    ],
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import(
            './pages/authentication/auth-signin-v5/auth-signin-v5.component'
          ).then((c) => c.AuthSigninV5Component),
      },
      {
        path: 'auth',
        loadChildren: () =>
          import('./pages/authentication/authentication.module').then(
            (m) => m.AuthenticationModule
          ),
      },
      {
        path: 'maintenance',
        loadChildren: () =>
          import('./pages/maintenance/maintenance.module').then(
            (m) => m.MaintenanceModule
          ),
      },
      {
        path: 'unauthorized',
        loadComponent: () =>
          import(
            './pages/maintenance/un-authorized/un-authorized.component'
          ).then((c) => c.UnAuthorizedComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/maintenance/error/error.component').then(
        (c) => c.ErrorComponent
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
