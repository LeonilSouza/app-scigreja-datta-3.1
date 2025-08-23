
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CargoFuncaoRoutingModule } from './cargo-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CargoFormComponent } from './cargo-form/cargo-form.component';
import { CargoService } from 'src/app/services/cargo.service';
import { CargoListComponent } from './cargo-list/cargo-list.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CargoFuncaoRoutingModule,
        SharedModule,
        ConfirmDialogModule,
        CargoListComponent,
        CargoFormComponent
    ],
    providers: [
        CargoService
    ]
})
export class CargoModule { }
