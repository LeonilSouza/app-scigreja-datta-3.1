import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'coming-soon',
        loadComponent: () => import('./coming-soon/coming-soon.component')
      },
      {
        path: 'error',
        loadComponent: () => import('./error/error.component').then((c) => c.ErrorComponent)
      },
      {
        path: 'offline-ui',
        loadComponent: () => import('./offline-ui/offline-ui.component')
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaintenanceRoutingModule {}
