import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from "src/app/app-config";
import { MatriculaAlunoDTO } from "../models/matricula-aluno.dto";


@Injectable()
export class MatriculaAlunoService {

  private apiPath: string = `${API_CONFIG.baseUrl}/matriculaalunos`;

  constructor(public http: HttpClient) {
  }

  findAll(): Observable<MatriculaAlunoDTO> {
    return this.http.get<MatriculaAlunoDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError));
  }

   getById(id: number): Observable<MatriculaAlunoDTO> {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
       map(this.jsonDataToMatriculaAluno)
    )
  }

  getByPageMatriculaAlunoFromIgreja(igrejaId, classeId, nome, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/matriculaalunos/page/?igreja=${igrejaId}&classe=${classeId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getByPageMatriculaAlunoFromTipo(igrejaId, nome, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/matriculaalunos/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getListMatriculaAlunoFromIgreja(igrejaId) {

    return this.http.get(`${API_CONFIG.baseUrl}/matriculaalunos/list/?igreja=${igrejaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  create(matriculaAluno: MatriculaAlunoDTO) {
    return this.http.post(this.apiPath,
      matriculaAluno,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(matriculaAluno: MatriculaAlunoDTO): Observable<MatriculaAlunoDTO> {
    const url = `${this.apiPath}/${matriculaAluno.id}`;

    return this.http.put(url, matriculaAluno)
      .pipe(
        map(this.jsonDataToMatriculaAluno),
        catchError(this.handleError),
        //map(this.jsonDataToMatriculaAlunoFuncao)
        map(() => matriculaAluno)
      )
  }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  private jsonDataToMatriculaAluno(jsonData: any): MatriculaAlunoDTO {
    return (new MatriculaAlunoDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
