import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SharedService } from 'src/app/services/shared.service';
import { UsuarioFormComponent } from './usuario-form/usuario-form.component';
import { UsuarioListComponent } from './usuario-list/usuario-list.component';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioRoutingModule } from './usuario-routing.module';
import { AcessoService } from 'src/app/services/acesso.service';
import { SetorService } from 'src/app/services/setor.service';
import { CargoService } from 'src/app/services/cargo.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { ImageCropperModule } from 'ngx-image-cropper';


@NgModule({
    imports: [
        ButtonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        UsuarioRoutingModule,
        SharedModule,
        ImageCropperModule,
        UsuarioListComponent,
        UsuarioFormComponent
    ],
    providers: [
        UsuarioService,
        SharedService,
        AcessoService,
        SetorService,
        CargoService
    ]
})
 export class UsuarioModule { }
