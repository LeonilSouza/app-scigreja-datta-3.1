
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CadastroListComponent } from './cadastro-list/cadastro-list.component';


const routes: Routes = [
  {
    path: '',
    component: CadastroListComponent,
    data: {
      title: 'Cadastros'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CadastroRoutingModule { }
