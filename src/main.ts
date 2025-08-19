// Angular Imports
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// project Imports
import { environment } from './environments/environment';
import { BasicAuthInterceptor } from 'src/app/theme/shared/_helpers/basic-auth.interceptor';
import { ErrorInterceptor } from 'src/app/theme/shared/_helpers/error.interceptor';
import { SharedModule } from './app/theme/shared/shared.module';
import { AppRoutingModule } from './app/app-routing.module';
import { AppComponent } from './app/app.component';

// third party
import { ToastrModule } from 'ngx-toastr';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      FormsModule,
      ReactiveFormsModule,
      SharedModule,
      ToastrModule.forRoot(),
      SweetAlert2Module.forRoot(),
      NgxEchartsModule.forRoot({
        echarts
      })
    ),
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations()
  ]
}).catch((err) => console.error(err));
