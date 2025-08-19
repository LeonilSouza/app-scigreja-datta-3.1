import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { FormaDTO } from "../models/forma.dto";

@Injectable()
export class FormaService {

    private apiPath: string = `${API_CONFIG.baseUrl}/formas`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<FormaDTO> {
        return this.http.get<FormaDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<FormaDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToForma)
        )
      }

      getByPageFormaFromIgreja(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/formas/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getByPageFormaFromTipo(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/formas/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getListFormaFromIgreja(igrejaId) {

        return this.http.get(`${API_CONFIG.baseUrl}/formas/list/?igreja=${igrejaId}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(forma : FormaDTO) {
      return this.http.post(this.apiPath,
        forma,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(forma: FormaDTO): Observable<FormaDTO> {
        const url = `${this.apiPath}/${forma.id}`;

        return this.http.put(url, forma)
          .pipe(
           map(this.jsonDataToForma),
           catchError(this.handleError),
           //map(this.jsonDataToFormaFuncao)
           map(() => forma)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToForma(jsonData: any): FormaDTO {
        return (new FormaDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
