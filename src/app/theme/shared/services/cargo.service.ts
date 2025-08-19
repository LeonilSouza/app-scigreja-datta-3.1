import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { CargoDTO } from "../models/cargo.dto";

@Injectable()
export class CargoService {

    private apiPath: string = `${API_CONFIG.baseUrl}/cargos`;

    constructor(public http: HttpClient) {
    }

    findById(id: number): Observable<CargoDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToCargo)
        )
      }

      getPageCargoFromIgreja(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/cargos/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getPageCargoFromTipo(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/cargos/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getListCargoFromIgreja(igrejaId) {

        return this.http.get(`${API_CONFIG.baseUrl}/cargos/?igreja=${igrejaId}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(cargo : CargoDTO) {
      return this.http.post(this.apiPath,
        cargo,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(cargo: CargoDTO): Observable<CargoDTO> {
        const url = `${this.apiPath}/${cargo.id}`;
        return this.http.put(url, cargo)
          .pipe(
           map(this.jsonDataToCargo),
           catchError(this.handleError),
           //map(this.jsonDataToCargoFuncao)
           map(() => cargo)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToCargo(jsonData: any): CargoDTO {
        return (new CargoDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
