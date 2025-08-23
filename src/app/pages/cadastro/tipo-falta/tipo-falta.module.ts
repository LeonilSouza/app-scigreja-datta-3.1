
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { ModalModule } from 'ngx-bootstrap/modal';
import { TipoFaltaService } from 'src/app/services/tipo-falta.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TipoFaltaRoutingModule } from './tipo-falta-routing.module';
import { TipoFaltaFormComponent } from './tipo-falta-form/tipo-falta-form.component';
import { TipoFaltaListComponent } from './tipo-falta-list/tipo-falta-list.component';


@NgModule({
  declarations: [
    TipoFaltaListComponent,
    TipoFaltaFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TipoFaltaRoutingModule,
    // ModalModule.forRoot(),
    SharedModule,
    ConfirmDialogModule

  ],
  providers: [
   TipoFaltaService
  ]
})
export class TipoFaltaModule { }
