import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { CategoriaDTO } from "../models/categoria.dto";

@Injectable()
export class CategoriaService {

    private apiPath: string = `${API_CONFIG.baseUrl}/categorias`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<CategoriaDTO> {
        return this.http.get<CategoriaDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<CategoriaDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToCategoria)
        )
      }

      getByPageCategoriaFromIgreja(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/categorias/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getListCategoriaFromIgreja(igrejaId) {
        return this.http.get(`${API_CONFIG.baseUrl}/categorias/list/?igreja=${igrejaId}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(disciplina : CategoriaDTO) {
      return this.http.post(this.apiPath,
        disciplina,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(disciplina: CategoriaDTO): Observable<CategoriaDTO> {
        const url = `${this.apiPath}/${disciplina.id}`;

        return this.http.put(url, disciplina)
          .pipe(
           map(this.jsonDataToCategoria),
           catchError(this.handleError),
           //map(this.jsonDataToCategoriaFuncao)
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


      private jsonDataToCategoria(jsonData: any): CategoriaDTO {
        return (new CategoriaDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
