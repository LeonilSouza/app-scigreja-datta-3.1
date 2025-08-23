import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { VariavelDTO } from "../models/variavel.dto";
import { API_CONFIG } from "src/app/app-config";

@Injectable()
export class VariavelService {

    private apiPath: string = `${API_CONFIG.baseUrl}/variaveis`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<VariavelDTO> {
        return this.http.get<VariavelDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<VariavelDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToVariavel)
        )
      }
      
      getByPageVariavel(variavel: any, page: any, linesPerPage: any) {

        return this.http.get(`${API_CONFIG.baseUrl}/variaveis/?variavel=${variavel}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

     create(variavel : VariavelDTO) {
      return this.http.post(this.apiPath,
        variavel,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(variavel: VariavelDTO): Observable<VariavelDTO> {
        const url = `${this.apiPath}/${variavel.id}`;

        return this.http.put(url, variavel)
          .pipe(
           map(this.jsonDataToVariavel),
           catchError(this.handleError),
           //map(this.jsonDataToVariavelFuncao)
           map(() => variavel)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToVariavel(jsonData: any): VariavelDTO {
        return (new VariavelDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
