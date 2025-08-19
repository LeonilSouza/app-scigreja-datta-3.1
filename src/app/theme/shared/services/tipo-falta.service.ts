import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { TipoFaltaDTO } from "../models/tipo-falta.dto";


@Injectable()
export class TipoFaltaService {

    private apiPath: string = `${API_CONFIG.baseUrl}/tipofaltas`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<TipoFaltaDTO> {
        return this.http.get<TipoFaltaDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<TipoFaltaDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToTipoFalta)
        )
      }

      getByPageTipoFaltaFromIgreja(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/tipofaltas/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getPageTipoFaltaFromTipo(igrejaId, tipo, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/tipofaltas/page/?igreja=${igrejaId}&tipo=${tipo}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getListTipoFaltaFromIgreja(igrejaId) {

        return this.http.get(`${API_CONFIG.baseUrl}/tipofaltas/list/?igreja=${igrejaId}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(tipoFalta : TipoFaltaDTO) {
      return this.http.post(this.apiPath,
        tipoFalta,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(tipoFalta: TipoFaltaDTO): Observable<TipoFaltaDTO> {
        const url = `${this.apiPath}/${tipoFalta.id}`;

        return this.http.put(url, tipoFalta)
          .pipe(
           map(this.jsonDataToTipoFalta),
           catchError(this.handleError),
           //map(this.jsonDataToTipoFaltaFuncao)
           map(() => tipoFalta)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToTipoFalta(jsonData: any): TipoFaltaDTO {
        return (new TipoFaltaDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
