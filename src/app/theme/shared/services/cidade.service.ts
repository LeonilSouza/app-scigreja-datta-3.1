import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { CidadeDTO } from "../models/cidade.dto";

@Injectable()
export class CidadeService {

    private apiPath: string = `${API_CONFIG.baseUrl}/cidades`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<CidadeDTO> {
        return this.http.get<CidadeDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<CidadeDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToCidade)
        )
      }

      getListaCidadesUfEstados(cidade: any = '') {

        return this.http.get(`${API_CONFIG.baseUrl}/cidades/?nome=${cidade}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(cidade : CidadeDTO) {
      return this.http.post(this.apiPath,
        cidade,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(cidade: CidadeDTO): Observable<CidadeDTO> {
        const url = `${this.apiPath}/${cidade.id}`;

        return this.http.put(url, cidade)
          .pipe(
           map(this.jsonDataToCidade),
           catchError(this.handleError),
           //map(this.jsonDataToCidadeFuncao)
           map(() => cidade)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToCidade(jsonData: any): CidadeDTO {
        return (new CidadeDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
