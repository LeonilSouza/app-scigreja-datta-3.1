import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/app/app-config';

@Injectable({
  providedIn: 'root'
})
export class LogExclusaoService {

  constructor(private http: HttpClient) { }

  listarLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${API_CONFIG.baseUrl}/auditoria/logs-exclusao`);
  }
}