import { SetorService } from 'src/app/services/setor.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
 

import { SetorRoutingModule } from './setor-routing.module';
import { SetorListComponent } from './setor-list/setor-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SetorFormComponent } from './setor-form/setor-form.component';
import { SharedService } from 'src/app/services/shared.service';



@NgModule({
    imports: [
        CommonModule,
        // AlertModule,
        FormsModule,
        ReactiveFormsModule,
        SetorRoutingModule,
        SharedModule,
        SetorListComponent,
        SetorFormComponent,
    ],
    providers: [
        SetorService,
        SharedService
    ]
})
export class SetorModule { }
