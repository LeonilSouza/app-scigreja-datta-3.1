import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../services/storage.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
 
  
  constructor(
    public storage: StorageService,
    private messageService: MessageService,
    private toastr: ToastrService,
    private router: Router,

    ) {
}


intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    return next.handle(req)
            .pipe(
                catchError(error => {
                    let errorObj = error;
                    if(errorObj.error ){

                       errorObj = errorObj.error;
                    }
                    if(!errorObj.status){
                        errorObj = JSON.parse(errorObj);
                    }
                    console.log(errorObj);

                    switch(errorObj.status) {

                        case 401:
                        this.handle401(errorObj);
                        break;

                        case 403:
                        this.handle403(errorObj);
                        break;

                        case 400:
                        this.handle400(errorObj);
                        break;

                        case 404:
                        this.handle404(errorObj);
                        break;

                        case 422:
                        this.handle422(errorObj);
                        break;

                        default:
                        this.handleDefaultEror(errorObj);
                    }

                    return throwError(() => errorObj);
                })) as any;
}

handle400(errorObj) {
    const error = errorObj.message
    this.messageService.add({severity:'error', summary: errorObj.error, detail: errorObj.message});
}

handle401(errorObj) {
    const error = errorObj.error + ' - ' + errorObj.message
    this.messageService.add({severity:'error', summary: errorObj.error, detail: errorObj.message});
}

handle403(errorObj) {
    this.storage.setLocalUser(null);
    this.storage.setLocalToken(null);
    this.storage.setLocalIgreja(null);
    this.router.navigate(['/login'])
    this.messageService.add({severity:'error', summary: errorObj.error, detail: 'Acesso negado'});

}

handle404(errorObj) {
    const error = errorObj.message
    this.toastr.error(error)
    this.messageService.add({severity:'error', summary: 'Servidor', detail: 'Erro no servidor'});
}


handle422(errorObj) {
    const error = errorObj.message
    this.toastr.error(error)
    this.messageService.add({severity:'error', summary: errorObj.error});
}

handleDefaultEror(errorObj) {
    const error = errorObj.message
    this.toastr.error(error)
    this.messageService.add({severity:'error', summary: errorObj.error, detail: errorObj.message});
}

}

export const ErrorInterceptorProvider = {
provide: HTTP_INTERCEPTORS,
useClass: ErrorInterceptor,
multi: true,
};