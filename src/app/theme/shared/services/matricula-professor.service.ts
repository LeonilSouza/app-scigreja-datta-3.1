import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from "src/app/app-config";
import { MatriculaProfessorDTO } from "../models/matricula-professor.dto";

@Injectable()
export class MatriculaProfessorService {

  private apiPath: string = `${API_CONFIG.baseUrl}/matriculaprofessores`;

  constructor(public http: HttpClient) {
  }

  findAll(): Observable<MatriculaProfessorDTO> {
    return this.http.get<MatriculaProfessorDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError));
  }

   getById(id: number): Observable<MatriculaProfessorDTO> {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
       map(this.jsonDataToMatriculaProfessor)
    )
  }

  getByPageMatriculaProfessorFromIgreja(igrejaId, classeId, nome, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/matriculaprofessores/page/?igreja=${igrejaId}&classe=${classeId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getByPageMatriculaProfessorFromTipo(igrejaId, nome, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/matriculaprofessores/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getListMatriculaProfessorFromIgreja(igrejaId) {

    return this.http.get(`${API_CONFIG.baseUrl}/matriculaprofessores/list/?igreja=${igrejaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  create(matriculaProfessor: MatriculaProfessorDTO) {
    return this.http.post(this.apiPath,
      matriculaProfessor,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(matriculaProfessor: MatriculaProfessorDTO): Observable<MatriculaProfessorDTO> {
    const url = `${this.apiPath}/${matriculaProfessor.id}`;

    return this.http.put(url, matriculaProfessor)
      .pipe(
        map(this.jsonDataToMatriculaProfessor),
        catchError(this.handleError),
        //map(this.jsonDataToMatriculaProfessorFuncao)
        map(() => matriculaProfessor)
      )
  }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  private jsonDataToMatriculaProfessor(jsonData: any): MatriculaProfessorDTO {
    return (new MatriculaProfessorDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
