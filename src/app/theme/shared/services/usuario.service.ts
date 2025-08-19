import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { StorageService } from './storage.service';
import { Observable, catchError, map, throwError } from 'rxjs';
import { API_CONFIG } from 'src/app/app-config';
import { UsuarioDTO } from '../models/usuario.dto';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiPath: string = `${API_CONFIG.baseUrl}/usuarios`;

  constructor(
    public http: HttpClient,
    public storage: StorageService,
  ) {
  }

  findAll(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError),
        // map(this.jsonDataToUsuarios)
      )
  }

  getUsuarioFromEmail(email): Observable<any> {
    return this.http.get(`${API_CONFIG.baseUrl}/usuarios/email?value=${email}`)
      .pipe(
        catchError(this.handleError)
    );
  }

  getPageFromUsuario(name, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/usuarios/page/?name=${name}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  findById(id: number): Observable<UsuarioDTO> {

    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToUsuario)
    )
  }

  create(usuario: UsuarioDTO) {
    return this.http.post(this.apiPath,
      usuario,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(usuario: UsuarioDTO): Observable<UsuarioDTO> {
    const url = `${this.apiPath}/${usuario.id}`;
    
    return this.http.put(url, usuario)
    .pipe(
      map(this.jsonDataToUsuario),
      catchError(this.handleError)
      )
  }

  upload(usuario: UsuarioDTO, formData: FormData): Observable<any> {
    const url = `${this.apiPath}/${usuario.id}/foto`;
    return this.http.put(url, formData, { responseType: 'blob' });
  }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }



  // PRIVATE METHODS

  private jsonDataToUsuarios(jsonData: any[]): UsuarioDTO[] {
    const usuarios: UsuarioDTO[] = [];

    jsonData.forEach(element => {
      const usuario = (new UsuarioDTO(), element);
      usuarios.push(usuario);
    });

    return usuarios;
  }


  private jsonDataToUsuario(jsonData: any): UsuarioDTO {
    return (new UsuarioDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(() => new Error(error));
  }

}
