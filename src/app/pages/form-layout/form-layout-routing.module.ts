// Angular Imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// project import
import { Role } from 'src/app/theme/shared/_helpers/role';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'layout',
        loadComponent: () => import('./forms-layouts/forms-layouts.component').then((c) => c.FormsLayoutsComponent),
        
      },
      {
        path: 'multiColumn',
        loadComponent: () => import('./form-multi-column/form-multi-column.component').then((c) => c.FormMultiColumnComponent),
        
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormLayoutRoutingModule {}
