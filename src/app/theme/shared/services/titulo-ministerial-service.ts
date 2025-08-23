import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { TituloMinisterialDTO } from "../models/titulo-ministerial.dto";
import { API_CONFIG } from "src/app/app-config";


@Injectable()
export class  TituloMinisterialService {

    private apiPath: string = `${API_CONFIG.baseUrl}/titulos`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<TituloMinisterialDTO> {
        return this.http.get<TituloMinisterialDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<TituloMinisterialDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToTituloMinisterial)
        )
      }

      getByPageTituloMinisterialFromIgreja(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/titulos/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getPageTituloMinisterialFromTipo(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/titulos/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getListTituloMinisterialFromIgreja(igrejaId) { // Lista tosdos os  s ministeriais padrão do sistema, mais os criados pela usuario

        return this.http.get(`${API_CONFIG.baseUrl}/titulos/list/?igreja=${igrejaId}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(ministerial : TituloMinisterialDTO) {
      return this.http.post(this.apiPath,
        ministerial,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(ministerial: TituloMinisterialDTO): Observable<TituloMinisterialDTO> {
        const url = `${this.apiPath}/${ministerial.id}`;

        return this.http.put(url, ministerial)
          .pipe(
           map(this.jsonDataToTituloMinisterial),
           catchError(this.handleError),
           //map(this.jsonDataToTituloMinisterialFuncao)
           map(() => ministerial)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToTituloMinisterial(jsonData: any):   TituloMinisterialDTO {
        return (new   TituloMinisterialDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
