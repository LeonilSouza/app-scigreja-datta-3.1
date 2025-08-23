
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DepartamentoRoutingModule } from './departamento-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxSelectModule } from 'ngx-select-ex';
// import { SelectDropDownModule } from 'ngx-select-dropdown';
// import { SelectModule } from 'ng-select';
import { DepartamentoService } from 'src/app/services/departamento.service';
import { DepartamentoListComponent } from './departamento-list/departamento-list.component';
// import { SelectOptionService } from 'src/app/services/select-option.service';
import { DepartamentoFormComponent } from './departamento-form/departamento-form.component';
import { ModalModule } from 'src/app/shared/components/modal/modal.module';


@NgModule({
  declarations: [
    DepartamentoListComponent,
    DepartamentoFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSelectModule,
    DepartamentoRoutingModule,
    // ModalModule.forRoot(),
    SharedModule

  ],
  providers: [
   DepartamentoService
  ]
})
export class DepartamentoModule { }
