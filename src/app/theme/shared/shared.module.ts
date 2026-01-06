// Angular Import
import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
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
import { AuthenticationService } from './services';
import { SharedService } from './services/shared.service';
import { UsuarioService } from './services/usuario.service';
import { StorageService } from './services/storage.service';
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from './_helpers/styles';
import { ConfirmationService, FilterMatchMode, MessageService } from 'primeng/api';
import { IgrejaService } from './services/igreja.service';
import { SelectModule } from 'primeng/select';

import { InputNumberModule } from 'primeng/inputnumber';
import { TabViewModule } from 'primeng/tabview';
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


import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

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
    TabViewModule,
    ToolbarModule,
    TableModule,
    AccordionModule,
    SplitButtonModule,
    TranslateModule.forRoot({
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
    TabViewModule,
    ToolbarModule,
    AccordionModule,
    SplitButtonModule,
    SelectModule,
  ],
  providers: [
    UsuarioService,
    SharedService,
    AuthenticationService,
    StorageService,
    MessageService,
    IgrejaService,
    ConfirmationService,
    { provide: LOCALE_ID, useValue: 'pt' },
    // Configuração PrimeNg
    providePrimeNG({
      ripple: true,
      inputStyle: 'outlined',
      theme: {
        preset: MyPreset,
        options: {
          prefix: 'p',
          darkModeSelector: '.my-app-dark',
          cssLayer: false,
        },
      },
      filterMatchModeOptions: {
        text: [
          FilterMatchMode.STARTS_WITH,
          FilterMatchMode.CONTAINS,
          FilterMatchMode.NOT_CONTAINS,
          FilterMatchMode.ENDS_WITH,
          FilterMatchMode.EQUALS,
          FilterMatchMode.NOT_EQUALS,
        ],
        numeric: [
          FilterMatchMode.EQUALS,
          FilterMatchMode.NOT_EQUALS,
          FilterMatchMode.LESS_THAN,
          FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
          FilterMatchMode.GREATER_THAN,
          FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
        ],
        date: [
          FilterMatchMode.DATE_IS,
          FilterMatchMode.DATE_IS_NOT,
          FilterMatchMode.DATE_BEFORE,
          FilterMatchMode.DATE_AFTER,
        ],
      },
      zIndex: {
        modal: 1100, // dialog, sidebar
        overlay: 1000, // dropdown, overlaypanel
        menu: 1000, // overlay menus
        tooltip: 1100, // tooltip
      },
      translation: {
        accept: 'Sim',
        reject: 'Não',
        startsWith: 'Começa com',
        contains: 'Contém',
        notContains: 'Não contém',
        endsWith: 'Termina com',
        equals: 'Igual a',
        notEquals: 'Diferente de',
        noFilter: 'Sem filtro',
        lt: 'Menor que',
        lte: 'Menor ou igual a',
        gt: 'Maior que',
        gte: 'Maior ou igual a',
        is: 'É',
        isNot: 'Não é',
        before: 'Antes',
        after: 'Depois',
        dateIs: 'Data é',
        dateIsNot: 'Data não é',
        dateBefore: 'Data antes de',
        dateAfter: 'Data depois de',
        clear: 'Limpar',
        apply: 'Aplicar',
        matchAll: 'Corresponder a todos',
        matchAny: 'Corresponder a qualquer um',
        addRule: 'Adicionar regra',
        removeRule: 'Remover regra',
        choose: 'Escolher',
        upload: 'Carregar',
        cancel: 'Cancelar',
        dayNames: [
          'Domingo',
          'Segunda',
          'Terça',
          'Quarta',
          'Quinta',
          'Sexta',
          'Sábado',
        ],
        dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
        monthNames: [
          'Janeiro',
          'Fevereiro',
          'Março',
          'Abril',
          'Maio',
          'Junho',
          'Julho',
          'Agosto',
          'Setembro',
          'Outubro',
          'Novembro',
          'Dezembro',
        ],
        monthNamesShort: [
          'Jan',
          'Fev',
          'Mar',
          'Abr',
          'Mai',
          'Jun',
          'Jul',
          'Ago',
          'Set',
          'Out',
          'Nov',
          'Dez',
        ],
        today: 'Hoje',
        weekHeader: 'Sem',
        firstDayOfWeek: 0,
        dateFormat: 'dd/mm/yy',
        weak: 'Fraco',
        medium: 'Médio',
        strong: 'Forte',
        passwordPrompt: 'Digite uma senha',
        emptyMessage: 'Nenhum resultado encontrado',
        emptyFilterMessage: 'Nenhum resultado encontrado',
      },
    }),
  ],
})
export class SharedModule { }
