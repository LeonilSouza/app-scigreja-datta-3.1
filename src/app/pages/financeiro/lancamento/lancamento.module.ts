import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSelectModule } from 'ngx-select-ex';
import { DropdownModule } from 'primeng/dropdown';
import { LancamentoListFormComponent } from './lancamento-list-form/lancamento-list-form.component';
import { LancamentoRoutingModule } from './lancamento-routing.module';
import { LancamentoService } from 'src/app/services/lancamento.service';
import { CalendarModule } from 'primeng/calendar';
import { IMaskModule } from 'angular-imask';
import { CategoriaService } from 'src/app/services/categoria.service';
import { ContaService } from 'src/app/services/conta.service';
import { CentroCustoService } from 'src/app/services/centro-custo.service';
import { PessoaService } from 'src/app/services/pessoa.service';
import { FormaService } from 'src/app/services/forma.service';


@NgModule({
  declarations: [
    LancamentoListFormComponent
  ],
  imports: [
    SharedModule,
    CalendarModule,
    DropdownModule,
    NgxSelectModule,
    LancamentoRoutingModule,
    IMaskModule

  ],
  providers: [
    LancamentoService,
    CategoriaService,
    ContaService,
    CentroCustoService,
    PessoaService,
    FormaService

  ]
})
export class LancamentoModule { }
