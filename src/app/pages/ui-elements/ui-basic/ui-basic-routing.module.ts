// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// project import

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'cards',
        loadComponent: () => import('./basic-card/basic-card.component').then((c) => c.BasicCardComponent),
        
      },
      {
        path: 'collapse',
        loadComponent: () => import('./basic-collapse/basic-collapse.component').then((c) => c.BasicCollapseComponent),
        
      },
      {
        path: 'other',
        loadComponent: () => import('./basic-other/basic-other.component').then((c) => c.BasicOtherComponent),
        
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UiBasicRoutingModule {}
