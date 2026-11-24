// Angular Imports
import { ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// Project Imports
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './theme/shared/shared.module';
import { BasicAuthInterceptor } from './theme/shared/_helpers/basic-auth.interceptor';
import { ErrorInterceptor } from './theme/shared/_helpers/error.interceptor';
import { CustomTranslateLoader } from './theme/shared/custom-translate-loader';
import { MyPreset } from './theme/shared/_helpers/styles';

// Services
import { AuthenticationService } from './theme/shared/services';
import { IgrejaService } from './theme/shared/services/igreja.service';
import { SharedService } from './theme/shared/services/shared.service';
import { StorageService } from './theme/shared/services/storage.service';
import { UsuarioService } from './theme/shared/services/usuario.service';

// Third Party
import { ToastrModule } from 'ngx-toastr';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MessageService, ConfirmationService, FilterMatchMode } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    // Serviços Globais
    UsuarioService,
    SharedService,
    AuthenticationService,
    StorageService,
    MessageService,
    IgrejaService,
    ConfirmationService,
    { provide: LOCALE_ID, useValue: 'pt' },

    // Configuração PrimeNG
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
        modal: 1100,
        overlay: 1000,
        menu: 1000,
        tooltip: 1100,
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

    // Módulos Globais
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      SharedModule,
      ToastrModule.forRoot(),
      SweetAlert2Module.forRoot(),
      NgxEchartsModule.forRoot({
        echarts,
      }),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: CustomTranslateLoader,
        },
      })
    ),

    // HTTP e Interceptors
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
  ],
};
