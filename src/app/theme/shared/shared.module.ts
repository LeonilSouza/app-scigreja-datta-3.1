// Angular Import
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BidiModule } from '@angular/cdk/bidi';

// Project import
import { CardComponent } from './components/card/card.component';
import { AlertComponent } from './components/alert/alert.component';
import { CustomTranslateLoader } from './custom-translate-loader';
import { AnimationModalComponent } from './components/modal/animation-modal/animation-modal.component';
import { UiModalComponent } from './components/modal/ui-modal/ui-modal.component';

// third party
import { NgScrollbarModule } from 'ngx-scrollbar';
import 'hammerjs';
import 'mousetrap';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

// bootstrap import
import {
  NgbDropdownModule,
  NgbNavModule,
  NgbModule,
  NgbCollapseModule,
  NgbProgressbar,
  NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap';
import { SelectModule } from 'primeng/select';

import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputMaskModule } from 'primeng/inputmask';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToolbarModule } from 'primeng/toolbar';
import { AccordionModule } from 'primeng/accordion';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ToastModule } from 'primeng/toast';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';

import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { PaginasPipe } from './_helpers/paginas.pipe';
import { SelectButtonModule } from 'primeng/selectbutton';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SelectModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    AlertComponent,
    NgbDropdownModule,
    NgbNavModule,
    NgbModule,
    NgbCollapseModule,
    NgScrollbarModule,
    NgbProgressbarModule,
    AnimationModalComponent,
    UiModalComponent,
    InputIconModule,
    GalleryModule,
    BidiModule,
    InputNumberModule,
    MultiSelectModule,
    InputTextModule,
    IconFieldModule,
    InputMaskModule,
    RadioButtonModule,
    CheckboxModule,
    ToastModule,
    PaginasPipe,
    TabsModule,
    ToolbarModule,
    SelectButtonModule,
    TableModule,
    AccordionModule,
    SplitButtonModule,
    FileUploadModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
      },
    }),
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardComponent,
    NgbModule,
    NgbDropdownModule,
    NgbNavModule,
    AlertComponent,
    NgbCollapseModule,
    NgScrollbarModule,
    NgbProgressbar,
    NgbProgressbarModule,
    InputIconModule,
    AnimationModalComponent,
    InputTextModule,
    UiModalComponent,
    GalleryModule,
    TranslateModule,
    BidiModule,
    IconFieldModule,
    ToastModule,
    InputNumberModule,
    MultiSelectModule,
    CheckboxModule,
    InputMaskModule,
    RadioButtonModule,
    TableModule,
    // TabViewModule,
    ToolbarModule,
    AccordionModule,
    SplitButtonModule,
    SelectModule,
    DialogModule,
    TabsModule,
    PaginasPipe,
    FileUploadModule,
    SelectButtonModule
  ]
})
export class SharedModule { }
