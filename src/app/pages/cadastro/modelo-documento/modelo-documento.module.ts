import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSelectModule } from 'ngx-select-ex';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CargoService } from 'src/app/services/cargo.service';
import { DepartamentoService } from 'src/app/services/departamento.service';


// third Party
import { QuillModule } from 'ngx-quill';
import { ModeloDocumentoService } from 'src/app/services/modelo-documento.service';
import { ModeloDocumentoListComponent } from './modelo-documento-list/modelo-documento-list.component';
import { ModeloDocumentoFormComponent } from './modelo-documento-form/modelo-documento-form.component';
import { ModeloDocumentoRoutingModule } from './modelo-documento-routing.module';
import { CKEditorModule } from 'ng2-ckeditor';
import { VariavelService } from 'src/app/services/variavel.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxSelectModule,
        ModeloDocumentoRoutingModule,
        // ModalModule,
        SharedModule,
        ImageCropperModule,
        QuillModule.forRoot(),
        CKEditorModule,
        ModeloDocumentoListComponent,
        ModeloDocumentoFormComponent,
    ],
    providers: [
        ModeloDocumentoService,
        DepartamentoService,
        CargoService,
        VariavelService
    ]
})
export class ModeloDocumentoModule { }