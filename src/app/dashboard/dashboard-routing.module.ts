// Angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// project import

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'default',
        loadComponent: () => import('./default/default.component').then((c) => c.DefaultComponent),
        
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
