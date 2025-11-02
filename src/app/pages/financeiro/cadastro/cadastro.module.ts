import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { ModalModule } from 'src/app/shared/components/modal/modal.module';
import { CadastroRoutingModule } from './cadastro-routing.module';
import { CadastroListComponent } from './cadastro-list/cadastro-list.component';
import { ContaService } from 'src/app/services/conta.service';
import { CategoriaService } from 'src/app/services/categoria.service';
import { DropdownModule } from 'primeng/dropdown';
import { CentroCustoService } from 'src/app/services/centro-custo.service';
import { FormaService } from 'src/app/services/forma.service';



@NgModule({
  declarations: [
    CadastroListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSelectModule,
    CadastroRoutingModule,
    ModalModule,
    SharedModule,
    DropdownModule

  ],
  providers: [
    ContaService,
    CategoriaService,
    CentroCustoService,
    FormaService

  ]
})
export class CadastroModule { }
