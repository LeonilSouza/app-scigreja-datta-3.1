import { AcessoService } from 'src/app/services/acesso.service';
import { IgrejaAtivaComponent } from './igreja-ativa/igreja-ativa.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';

import { IgrejaRoutingModule } from './igreja-routing.module';
import { IgrejaListComponent } from './igreja-list/igreja-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { CalendarModule } from 'primeng/calendar';

import { IgrejaService } from 'src/app/services/igreja.service';
import { SetorService } from 'src/app/services/setor.service';
import { CargoService } from 'src/app/services/cargo.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { IgrejaFormComponent } from './igreja-form/igreja-form.component';
import { DropdownModule } from 'primeng/dropdown';


@NgModule({
    imports: [
        CommonModule,
        IgrejaRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarModule,
        NgxSelectModule,
        SharedModule,
        DropdownModule,
        // NgxDatatableModule,
        ImageCropperModule,
        IgrejaFormComponent,
        IgrejaListComponent,
        IgrejaAtivaComponent
    ],
    providers: [
        IgrejaService,
        SetorService,
        AcessoService,
        CargoService
    ],
    exports: [
        IgrejaAtivaComponent
    ]
})
export class IgrejaModule { }
