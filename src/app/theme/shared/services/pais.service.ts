import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "src/app/app-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { PaisDTO } from "../models/pais.dto";

@Injectable()
export class PaisService {

    private apiPath: string = `${API_CONFIG.baseUrl}/paises`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<PaisDTO> {
        return this.http.get<PaisDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<PaisDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToPais)
        )
      }

      getListaPaisSigla(nomeSemAcento: any = '') {

        return this.http.get(`${API_CONFIG.baseUrl}/paises/?nomeSemAcento=${nomeSemAcento}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(pais : PaisDTO) {
      return this.http.post(this.apiPath,
        pais,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(pais: PaisDTO): Observable<PaisDTO> {
        const url = `${this.apiPath}/${pais.id}`;

        return this.http.put(url, pais)
          .pipe(
           map(this.jsonDataToPais),
           catchError(this.handleError),
           //map(this.jsonDataToPaisFuncao)
           map(() => pais)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToPais(jsonData: any): PaisDTO {
        return (new PaisDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
