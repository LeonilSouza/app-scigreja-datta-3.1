
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LancamentoListFormComponent } from './lancamento-list-form/lancamento-list-form.component';


const routes: Routes = [
  {
    path: '',
    component:LancamentoListFormComponent,
    data: {
      title: 'Extratos | Lançamentos'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LancamentoRoutingModule { }
