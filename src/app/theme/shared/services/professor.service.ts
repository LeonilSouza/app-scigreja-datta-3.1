import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from "src/app/app-config";
import { ProfessorDTO } from "../models/professor.dto";

@Injectable()
export class ProfessorService {

  private apiPath: string = `${API_CONFIG.baseUrl}/professores`;

  constructor(public http: HttpClient) {
  }

  findAll(): Observable<ProfessorDTO> {
    return this.http.get<ProfessorDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError));
  }

   getById(id: number): Observable<ProfessorDTO> {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
       map(this.jsonDataToProfessor)
    )
  }

  getByPageProfessorFromIgreja(igrejaId, classeId, nome, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/professores/page/?igreja=${igrejaId}&classe=${classeId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getByPageProfessorFromTipo(igrejaId, nome, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/professores/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getListProfessorFromIgreja(igrejaId) {

    return this.http.get(`${API_CONFIG.baseUrl}/professores/list/?igreja=${igrejaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  create(professor: ProfessorDTO) {
    return this.http.post(this.apiPath,
      professor,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(professor: ProfessorDTO): Observable<ProfessorDTO> {
    const url = `${this.apiPath}/${professor.id}`;

    return this.http.put(url, professor)
      .pipe(
        map(this.jsonDataToProfessor),
        catchError(this.handleError),
        //map(this.jsonDataToProfessorFuncao)
        map(() => professor)
      )
  }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  private jsonDataToProfessor(jsonData: any): ProfessorDTO {
    return (new ProfessorDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
