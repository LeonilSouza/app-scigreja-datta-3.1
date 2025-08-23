import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { DisciplinaDTO } from "../models/disciplina.dto";
import { API_CONFIG } from "src/app/app-config";

@Injectable()
export class DisciplinaService {

    private apiPath: string = `${API_CONFIG.baseUrl}/disciplinas`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<DisciplinaDTO> {
        return this.http.get<DisciplinaDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<DisciplinaDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToDisciplina)
        )
      }

      getByPageDisciplinaFromIgreja(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/disciplinas/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getByPageDisciplinaFromTipo(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/disciplinas/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getListDisciplinaFromIgreja(igrejaId) {

        return this.http.get(`${API_CONFIG.baseUrl}/disciplinas/list/?igreja=${igrejaId}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(disciplina : DisciplinaDTO) {
      return this.http.post(this.apiPath,
        disciplina,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(disciplina: DisciplinaDTO): Observable<DisciplinaDTO> {
        const url = `${this.apiPath}/${disciplina.id}`;

        return this.http.put(url, disciplina)
          .pipe(
           map(this.jsonDataToDisciplina),
           catchError(this.handleError),
           //map(this.jsonDataToDisciplinaFuncao)
           map(() => disciplina)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToDisciplina(jsonData: any): DisciplinaDTO {
        return (new DisciplinaDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
