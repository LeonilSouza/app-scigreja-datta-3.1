import { IgrejaAtivaComponent } from './igreja-ativa/igreja-ativa.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';

import { IgrejaRoutingModule } from './igreja-routing.module';
import { IgrejaListComponent } from './igreja-list/igreja-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { IgrejaFormComponent } from './igreja-form/igreja-form.component';
import { DropdownModule } from 'primeng/dropdown';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { IgrejaService } from 'src/app/theme/shared/services/igreja.service';
import { SetorService } from 'src/app/theme/shared/services/setor.service';
import { AcessoService } from 'src/app/theme/shared/services/acesso.service';
import { CargoService } from 'src/app/theme/shared/services/cargo.service';


@NgModule({
    imports: [
        CommonModule,
        IgrejaRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarModule,
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
