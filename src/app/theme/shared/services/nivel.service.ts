import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { NivelDTO } from "../models/nivel.dto";

@Injectable()
export class NivelService {

    private apiPath: string = `${API_CONFIG.baseUrl}/niveis`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<NivelDTO> {
        return this.http.get<NivelDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<NivelDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToNivel)
        )
      }

      getByPageNivelFromIgreja(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/niveis/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getListNivelFromIgreja(igrejaId) {

        return this.http.get(`${API_CONFIG.baseUrl}/niveis/?igreja=${igrejaId}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(nivel : NivelDTO) {
      return this.http.post(this.apiPath,
        nivel,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(nivel: NivelDTO): Observable<NivelDTO> {
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


      private jsonDataToNivel(jsonData: any): NivelDTO {
        return (new NivelDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
