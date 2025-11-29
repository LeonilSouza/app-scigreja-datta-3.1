import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "src/app/app-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { LancamentoCargoDeptoDTO } from "../models/lancamento-cargo-depto.dto";

@Injectable()
export class LancamentoCargoDeptoService {

    private apiPath: string = `${API_CONFIG.baseUrl}/lancamentocargodeptos`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<LancamentoCargoDeptoDTO> {
        return this.http.get<LancamentoCargoDeptoDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<LancamentoCargoDeptoDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToLancamentoCargoDepto)
        )
      }

      getByPageLancamentoCargoDeptoFromIgreja(igrejaId, nomePessoa, pageSize, limit) {

        return this.http.get(`${API_CONFIG.baseUrl}/lancamentocargodeptos/?igreja=${igrejaId}&nomePessoa=${nomePessoa}&pageSize=${pageSize}&limit=${limit}`)
          .pipe(
            catchError(this.handleError)
        );
      }

     create(LancamentoCargoDepto : LancamentoCargoDeptoDTO) {
      return this.http.post(this.apiPath,
        LancamentoCargoDepto,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(LancamentoCargoDepto: LancamentoCargoDeptoDTO): Observable<LancamentoCargoDeptoDTO> {
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


      private jsonDataToLancamentoCargoDepto(jsonData: any): LancamentoCargoDeptoDTO {
        return (new LancamentoCargoDeptoDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
