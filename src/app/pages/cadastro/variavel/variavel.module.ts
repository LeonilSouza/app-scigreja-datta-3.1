import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CargoService } from 'src/app/services/cargo.service';
import { DepartamentoService } from 'src/app/services/departamento.service';


// third Party
// import { QuillModule } from 'ngx-quill';
import { VariavelService } from 'src/app/services/variavel.service';
import { VariavelFormComponent } from './variavel-form/variavel-form.component';
import { VariavelListComponent } from './variavel-list/variavel-list.component';
import { VariavelRoutingModule } from './variavel-routing.module';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxSelectModule,
        VariavelRoutingModule,
        SharedModule,
        ImageCropperModule,
        VariavelListComponent,
        VariavelFormComponent,
    ],
    providers: [
        VariavelService,
        DepartamentoService,
        CargoService
    ]
})
export class VariavelModule { }
