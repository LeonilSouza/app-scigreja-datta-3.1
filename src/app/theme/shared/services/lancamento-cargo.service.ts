import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "src/app/app-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { LancamentoCargoDTO } from "../models/lancamento-cargo.dto";

@Injectable()
export class LancamentoCargoService {

    private apiPath: string = `${API_CONFIG.baseUrl}/lancamentocargodeptos`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<LancamentoCargoDTO> {
        return this.http.get<LancamentoCargoDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<LancamentoCargoDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToLancamentoCargoDepto)
        )
      }

      getByPageLancamentoCargoDeptoFromIgreja(igrejaId: any, nomePessoa: any, pageSize: any, limit: any) {

        return this.http.get(`${API_CONFIG.baseUrl}/lancamentocargodeptos/?igreja=${igrejaId}&nomePessoa=${nomePessoa}&pageSize=${pageSize}&limit=${limit}`)
          .pipe(
            catchError(this.handleError)
        );
      }

     create(LancamentoCargoDepto : LancamentoCargoDTO) {
      return this.http.post(this.apiPath,
        LancamentoCargoDepto,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(LancamentoCargoDepto: LancamentoCargoDTO): Observable<LancamentoCargoDTO> {
        const url = `${this.apiPath}/${LancamentoCargoDepto.id}`;

        return this.http.put(url, LancamentoCargoDepto)
          .pipe(
           map(this.jsonDataToLancamentoCargoDepto),
           catchError(this.handleError),
           //map(this.jsonDataToLancamentoCargoDeptoFuncao)
           map(() => LancamentoCargoDepto)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToLancamentoCargoDepto(jsonData: any): LancamentoCargoDTO {
        return (new LancamentoCargoDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
