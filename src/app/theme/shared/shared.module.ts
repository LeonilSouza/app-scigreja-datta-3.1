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
  NgbProgressbarModule
} from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from './services';
import { SharedService } from './services/shared.service';
import { UsuarioService } from './services/usuario.service';
import { StorageService } from './services/storage.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
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
    GalleryModule,
    BidiModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader
      }
    })
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
    AnimationModalComponent,
    UiModalComponent,
    GalleryModule,
    TranslateModule,
    BidiModule
  ], 
   providers: [
      UsuarioService,
      SharedService,
      AuthenticationService,
      StorageService
    ],
})
export class SharedModule {}
