import { PessoaService } from 'src/app/services/pessoa.service';
import { DisciplinaService } from 'src/app/services/disciplina.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';


// Buttons Routing
import { IgrejaService } from '../../services/igreja.service';
import { CasoService } from '../../services/caso.service';
import { CalendarModule } from "primeng/calendar";
import { NgxSelectModule } from 'ngx-select-ex';
import { CasoRoutingModule } from './caso-routing.module';
import { CasoFormComponent } from './caso-form/caso-form.component';
import { CasoListComponent } from './caso-list/caso-list.component';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TipoFaltaService } from 'src/app/services/tipo-falta.service';



// Angular

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
     ReactiveFormsModule,
     CasoRoutingModule,
     SplitButtonModule,
     CalendarModule,
     NgxSelectModule,
     SharedModule,


  ],
  declarations: [
    CasoListComponent,
    CasoFormComponent

  ],

  providers: [
    CasoService,
    IgrejaService,
    DisciplinaService,
    PessoaService,
    TipoFaltaService

  ]
})

export class CasoModule { }
