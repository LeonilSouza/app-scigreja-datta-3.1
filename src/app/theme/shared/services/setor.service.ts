import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SetorDTO } from "../models/setor.dto";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from "src/app/app-config";

@Injectable()
export class SetorService {

  private apiPath: string = `${API_CONFIG.baseUrl}/setores`;

  constructor(public http: HttpClient) {
  }

  findAll(): Observable<SetorDTO> { //Busca todos os setores 
    return this.http.get<SetorDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError));
  }

  //Igual o findAll só que paginado / os dois usa o mesmo metodo no banco
  getPageSetor(nome, page, linesPerPage) { 
    return this.http.get(`${API_CONFIG.baseUrl}/setores/?nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
    );
  }

  //Igual o findAll só que paginado / os dois usa o mesmo metodo no banco
  geCountSetor() { 
    return this.http.get(`${API_CONFIG.baseUrl}/setores/count`)
      .pipe(
        catchError(this.handleError)
    );
  }


  // Busca de Setor

  // Admin
  findSetorIgrejaNewAdmin(): Observable<SetorDTO> { // Busca setor da Igreja
    return this.http.get(`${API_CONFIG.baseUrl}/setores`)
      .pipe(
        catchError(this.handleError));
  }

  findSetorIgrejaEditAdmin(): Observable<SetorDTO> { // Busca setor da Igreja
    return this.http.get(`${API_CONFIG.baseUrl}/setores`)
      .pipe(
        catchError(this.handleError));
  }

  // Usuario
  findSetorIgrejaNewUsuario(setorId): Observable<SetorDTO> { // Busca setor da Igreja
    return this.http.get(`${API_CONFIG.baseUrl}/setores/?setorId=${setorId}`)
      .pipe(
        catchError(this.handleError));
  }

  findSetorIgrejaEditUsuario(setorId): Observable<SetorDTO> { // Busca setor da Igreja
    return this.http.get(`${API_CONFIG.baseUrl}/setores/?setorId=${setorId}`)
      .pipe(
        catchError(this.handleError));
  }

  // Fim Busca Setor


  findById(id: number): Observable<SetorDTO> {

    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToSetor)
    )
  }

  create(setor: SetorDTO) {
    return this.http.post(this.apiPath,
      setor,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(setor: SetorDTO): Observable<SetorDTO> {
    console.log(setor)
    const url = `${this.apiPath}/${setor.id}`;

    return this.http.put(url, setor)
      .pipe(
        map(this.jsonDataToSetor),
        catchError(this.handleError),
        //map(this.jsonDataToSetor)
        map(() => setor)
      )
  }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  private jsonDataToSetor(jsonData: any): SetorDTO {
    return (new SetorDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
