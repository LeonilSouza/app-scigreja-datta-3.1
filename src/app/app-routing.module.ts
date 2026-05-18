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
        loadChildren: () => import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTE),
      },
      {
        path: 'pessoas',
        loadChildren: () => import('./pages/pessoa/pessoa.routes').then((m) => m.PESSOA_ROUTES),
      },
      {
        path: 'disciplinas',
        loadChildren: () => import('./pages/cadastro/disciplina/disciplina.routes').then((d) => d.DISCIPLINA_ROUTES),
      },
      {
        path: 'cargos',
        loadChildren: () => import('./pages/cadastro/cargo/cargo.routes').then((d) => d.CARGO_ROUTES),
      },
      {
        path: 'igrejas',
        loadChildren: () => import('./pages/cadastro/igreja/igreja.routes').then((module) => module.IGREJA_ROUTES),
      },
      {
        path: 'ativas',
        loadChildren: () => import('./pages/cadastro/igreja/igreja.routes').then((module) => module.IGREJA_ROUTES),
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./pages/cadastro/usuario-acesso/usuario.routes').then((module) => module.USUARIO_ROUTES),
      },
      {
        path: 'setores',
        loadChildren: () => import('./pages/cadastro/setor/setor.routes').then((module) => module.SETOR_ROUTES),
      },
      {
        path: 'titulos',
        loadChildren: () => import('./pages/cadastro/titulo-ministerial/titulo-ministerial.routes').then((module) => module.TITULO_MINISTERIAL_ROUTES),
      },
      {
        path: 'modelodocumentos',
        loadChildren: () => import('./pages/cadastro/modelo-documento/modelo-documento-routes').then((module) => module.MODELO_DOCUMENTO_ROUTES),
      },
      {
        path: 'lancamentocargodeptos',
        loadChildren: () => import('./pages/lancamento-cargo-depto/lancamento-cargo.routes').then((module) => module.LANCAMENTO_CARGO_ROUTES),
      },
      {
        path: 'variaveis',
        loadChildren: () => import('./pages/cadastro/variavel/variavel.routes').then((module) => module.VARIAVEL_ROUTES),
      },
      {
        path: 'tipofaltas',
        loadChildren: () => import('./pages/cadastro/tipo-falta/tipo-falta.routes').then((module) => module.TIPO_FALTA_ROUTES),
      },
      {
        path: 'departamentos',
        loadChildren: () => import('./pages/cadastro/departamento/departamento.routes').then((module) => module.DEPARTAMENTO_ROUTES),
      },
      {
        path: 'cartas',
        loadChildren: () => import('./pages/carta/carta.routes').then((module) => module.CARTA_ROUTES),
      },
      {
        path: 'casos',
        loadChildren: () => import('./pages/caso/caso.routes').then((module) => module.CASO_ROUTES),
      },
      {
        path: 'classes',
        loadChildren: () => import('./pages/escola-biblica-dominical/classe/classe.routes').then((module) => module.CLASSE_ROUTES),
      },
      {
        path: 'professores',
        loadChildren: () => import('./pages/escola-biblica-dominical/professor/professor.routes').then((module) => module.PROFESSOR_ROUTES),
      },
      {
        path: 'alunos',
        loadChildren: () => import('./pages/escola-biblica-dominical/aluno/aluno.routes').then((module) => module.ALUNO_ROUTES),
      },
      {
        path: 'frequencias',
        loadChildren: () => import('./pages/escola-biblica-dominical/frequencia/frequencia.routes').then((module) => module.FREQUENCIA_ROUTES),
      },

      {
        path: 'cadastros',
        loadChildren: () => import('./pages/financeiro/cadastro/cadastro.routes').then((module) => module.CADASTRO_ROUTES),
      },
      {
        path: 'lancamentos',
        loadChildren: () => import('./pages/financeiro/lancamento/lancamento.routes').then((module) => module.LANCAMENTO_ROUTES),
      },
      {
        path: 'dashboard-finance',
        loadChildren: () => import('./pages/financeiro/lancamento/lancamento.routes').then((module) => module.LANCAMENTO_ROUTES),
      },
       {
        path: 'contas-pagar',
        loadChildren: () => import('./pages/financeiro/contas-pagar/contas-pagar.routes').then((module) => module.CONTAS_PAGAR_ROUTES),
      },
      
      // {
      //   path: 'casos',
      //   loadChildren: () =>
      //     import('./pages/caso/caso.module').then(
      //       (module) => module.CasoModule
      //     ),
      // },
      // {
      //   path: 'cargodeptos',
      //   loadChildren: () =>
      //     import('./pages/cargo-departamento/cargo-departamento.module').then(
      //       (module) => module.CargoDepartamentoModule
      //     ),
      // },
      // {
      //   path: 'variaveis',
      //   loadChildren: () =>
      //     import('./pages/cadastro/variavel/variavel.module').then(
      //       (module) => module.VariavelModule
      //     ),
      // },
      // {
      //   path: 'cadastros',
      //   loadChildren: () =>
      //     import('./pages/financeiro/cadastro/cadastro.module').then(
      //       (module) => module.CadastroModule
      //     ),
      // },
      // {
      //   path: 'lancamentos',
      //   loadChildren: () =>
      //     import('./pages/financeiro/lancamento/lancamento.module').then(
      //       (module) => module.LancamentoModule
      //     ),
      // },
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
export class AppRoutingModule { }
