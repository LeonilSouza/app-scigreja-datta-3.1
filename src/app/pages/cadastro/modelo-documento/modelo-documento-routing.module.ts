import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModeloDocumentoFormComponent } from './modelo-documento-form/modelo-documento-form.component';
import { ModeloDocumentoListComponent } from './modelo-documento-list/modelo-documento-list.component';


const routes: Routes = [
  {
    path: '',
    component: ModeloDocumentoListComponent,
    data: {
      title: 'Modelo Documento'
    }
  },

  {
    path: 'new',
    component: ModeloDocumentoFormComponent,
    data: {
      title: 'Modelo Documento'
    }
  },

  {
    path: ':id/edit',
    component: ModeloDocumentoFormComponent,
    data: {
      title: 'Modelo Documento'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModeloDocumentoRoutingModule { }
