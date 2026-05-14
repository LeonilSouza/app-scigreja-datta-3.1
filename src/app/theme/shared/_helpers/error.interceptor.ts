import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../services/storage.service';
import Swal from 'sweetalert2';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {


    constructor(
        public storage: StorageService,
        private messageService: MessageService,
        private toastr: ToastrService,
        private router: Router,

    ) {
    }


    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req)
            .pipe(
                catchError(error => {
                    if (error.error instanceof Blob) {
                        // Truque mágico: Converte o Blob de erro em texto de forma assíncrona
                        const reader = new FileReader();
                        reader.onload = () => {
                            try {
                                const erroJson = JSON.parse(reader.result as string);
                                // Agora você tem o erro real do Java! Pode mandar para o toastr ou console
                                console.error('Erro real do Java decodificado:', erroJson);
                            } catch (e) {
                                console.error('Erro de texto puro do servidor:', reader.result);
                            }
                        };
                        reader.readAsText(error.error);
                    } else {
                        // Lógica normal que você já tinha para erros que não são Blob
                        // JSON.parse(error.error) ...
                    }
                    let errorObj = error;
                    if (errorObj.error) {

                        errorObj = errorObj.error;
                    }
                    if (!errorObj.status) {
                        errorObj = JSON.parse(errorObj);
                    }
                    console.log(errorObj);

                    switch (errorObj.status) {

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

    handle400(errorObj: { message: any; error: any; }) {
        const error = errorObj.message
        this.messageService.add({ severity: 'error', summary: errorObj.error, detail: errorObj.message });
    }

    handle401(errorObj: { error: string; message: string; }) {
        const error = errorObj.error + ' - ' + errorObj.message
        this.messageService.add({ severity: 'error', summary: errorObj.error, detail: errorObj.message });
    }

    handle403(errorObj: { message: any; }) {
        const error = errorObj.message
        this.storage.setLocalUser(null!);
        this.storage.setLocalToken(null!);
        this.storage.setLocalIgreja(null!);
        this.router.navigate(['/login'])
        this.toastr.error(error);

    }

    handle404(errorObj: { message: any; }) {
        const error = errorObj.message
        this.toastr.info(error);
        // Swal.fire('', (error), 'info');
    }


    handle422(errorObj: { message: any; }) {
        const error = errorObj.message
        this.toastr.error(error);
    }

    handleDefaultEror(errorObj: { message: any; }) {
        const error = errorObj.message
        this.toastr.error(error);
    }

}

export const ErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true,
};