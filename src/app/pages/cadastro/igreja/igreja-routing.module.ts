import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IgrejaAtivaComponent } from './igreja-ativa/igreja-ativa.component';
import { IgrejaFormComponent } from './igreja-form/igreja-form.component';
import { IgrejaListComponent } from './igreja-list/igreja-list.component';

const routes: Routes = [

  {
    path: '',
    component: IgrejaListComponent,
    data: {
      title: 'Igreja'
    }
  },
  
  {
    path: 'ativa',
    component: IgrejaAtivaComponent,
    data: {
      title: 'Igreja Ativa'
    }
  },

  {
    path: 'new',
    component: IgrejaFormComponent,
    data: {
      title: 'Igreja'
    }
  },

  {
    path: ':id/edit',
    component: IgrejaFormComponent,
    data: {
      title: 'Igreja' 
    }
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IgrejaRoutingModule { }
