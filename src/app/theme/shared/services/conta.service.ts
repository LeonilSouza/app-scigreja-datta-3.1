import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { ContaDTO } from "../models/conta.dto";
import { API_CONFIG } from "src/app/app-config";

@Injectable()
export class ContaService {

    private apiPath: string = `${API_CONFIG.baseUrl}/contas`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<ContaDTO> {
        return this.http.get<ContaDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<ContaDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToConta)
        )
      }

      getByPageContaFromIgreja(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/contas/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }


      getListContaFromIgreja(igrejaId) {

        return this.http.get(`${API_CONFIG.baseUrl}/contas/list/?igreja=${igrejaId}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(conta : ContaDTO) {
      return this.http.post(this.apiPath,
        conta,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(conta: ContaDTO): Observable<ContaDTO> {
        const url = `${this.apiPath}/${conta.id}`;

        return this.http.put(url, conta)
          .pipe(
           map(this.jsonDataToConta),
           catchError(this.handleError),
           //map(this.jsonDataToContaFuncao)
           map(() => conta)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToConta(jsonData: any): ContaDTO {
        return (new ContaDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
