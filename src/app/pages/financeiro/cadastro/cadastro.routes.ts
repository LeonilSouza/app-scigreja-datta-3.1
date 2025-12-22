
import { Routes } from '@angular/router';
import { CadastroListComponent } from './cadastro-list/cadastro-list.component';


export const CADASTRO_ROUTES: Routes = [
  {
    path: '',
    component: CadastroListComponent,
    data: {
      title: 'Cadastros'
    }
  }
];

