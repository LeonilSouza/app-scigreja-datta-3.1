import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { CentroCustoDTO } from "../models/centro-custo.dto";

@Injectable()
export class CentroCustoService {

    private apiPath: string = `${API_CONFIG.baseUrl}/centrocustos`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<CentroCustoDTO> {
        return this.http.get<CentroCustoDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<CentroCustoDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToCentroCusto)
        )
      }

      getByPageCentroCustoFromIgreja(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/centrocustos/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getByPageCentroCustoFromTipo(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/centrocustos/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getListCentroCustoFromIgreja(igrejaId) {

        return this.http.get(`${API_CONFIG.baseUrl}/centrocustos/list/?igreja=${igrejaId}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(centrocustos : CentroCustoDTO) {
      return this.http.post(this.apiPath,
        centrocustos,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(centrocustos: CentroCustoDTO): Observable<CentroCustoDTO> {
        const url = `${this.apiPath}/${centrocustos.id}`;

        return this.http.put(url, centrocustos)
          .pipe(
           map(this.jsonDataToCentroCusto),
           catchError(this.handleError),
           //map(this.jsonDataToCentroCustoFuncao)
           map(() => centrocustos)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToCentroCusto(jsonData: any): CentroCustoDTO {
        return (new CentroCustoDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
