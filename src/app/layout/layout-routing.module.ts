// Angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// project import

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'horizontal',
        loadComponent: () => import('./theme-horizontal/theme-horizontal.component').then((c) => c.ThemeHorizontalComponent),
        
      },
      {
        path: 'box',
        loadComponent: () => import('./theme-box/theme-box.component').then((c) => c.ThemeBoxComponent),
        
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule {}
