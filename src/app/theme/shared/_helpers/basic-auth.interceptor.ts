import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { StorageService } from '../services/storage.service';
import { API_CONFIG } from 'src/app/app-config';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
  private storage = inject(StorageService);


  intercept(request: HttpRequest<string>, next: HttpHandler): Observable<HttpEvent<string>> {
    // add auth header with jwt if user is logged in and request is to the api url
    const currentUser = this.storage.getLocalUser();
    const isApiUrl = request.url.startsWith(API_CONFIG.baseUrl);
    const token = this.storage.getLocalToken();
    if (currentUser && isApiUrl && token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
