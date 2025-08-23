import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { TituloMinisterialRoutingModule } from './titulo-ministerial-routing.module';
import { TituloMinisterialFormComponent } from './titulo-ministerial-form/titulo-ministerial-form.component';
import { TituloMinisterialListComponent } from './titulo-ministerial-list/titulo-ministerial-list.component';
import { TituloMinisterialService } from 'src/app/services/titulo-ministerial-service';




@NgModule({
    imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSelectModule,
    TituloMinisterialRoutingModule,
    SharedModule,
    TituloMinisterialListComponent,
    TituloMinisterialFormComponent
],
    providers: [
        TituloMinisterialService
    ]
})
export class TituloMinisterialModule { }
