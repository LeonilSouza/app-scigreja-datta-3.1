import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from "src/app/app-config";

@Injectable()
export class NivelService {

    private apiPath: string = `${API_CONFIG.baseUrl}/niveis`;

    constructor(public http: HttpClient) {
    }

    findAll() {
        return this.http.get(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number) {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToNivel)
        )
      }

      getByPageNivelFromIgreja(igrejaId: any, nome: any, page: any, linesPerPage: any) {

        return this.http.get(`${API_CONFIG.baseUrl}/niveis/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getListNivelFromIgreja(igrejaId: any) {

        return this.http.get(`${API_CONFIG.baseUrl}/niveis/?igreja=${igrejaId}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(nivel: any) {
      return this.http.post(this.apiPath,
        nivel,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(nivel: any): Observable<any> {
        const url = `${this.apiPath}/${nivel.id}`;

        return this.http.put(url, nivel)
          .pipe(
           map(this.jsonDataToNivel),
           catchError(this.handleError),
           //map(this.jsonDataToNivelFuncao)
           map(() => nivel)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToNivel(jsonData: any): any {
        return ( jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
