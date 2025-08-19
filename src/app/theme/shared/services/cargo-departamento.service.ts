import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { CargoDeptoDTO } from "../models/cargo-depto.dto";

@Injectable()
export class CargoDepartamentoService {

    private apiPath: string = `${API_CONFIG.baseUrl}/cargodeptos`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<CargoDeptoDTO> {
        return this.http.get<CargoDeptoDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<CargoDeptoDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToCargoDepto)
        )
      }

      getByPageCargoDeptoFromIgreja(igrejaId, nomePessoa, pageSize, limit) {

        return this.http.get(`${API_CONFIG.baseUrl}/cargodeptos/?igreja=${igrejaId}&nomePessoa=${nomePessoa}&pageSize=${pageSize}&limit=${limit}`)
          .pipe(
            catchError(this.handleError)
        );
      }

     create(cargoDepto : CargoDeptoDTO) {
      return this.http.post(this.apiPath,
        cargoDepto,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(cargoDepto: CargoDeptoDTO): Observable<CargoDeptoDTO> {
        const url = `${this.apiPath}/${cargoDepto.id}`;

        return this.http.put(url, cargoDepto)
          .pipe(
           map(this.jsonDataToCargoDepto),
           catchError(this.handleError),
           //map(this.jsonDataToCargoDeptoFuncao)
           map(() => cargoDepto)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToCargoDepto(jsonData: any): CargoDeptoDTO {
        return (new CargoDeptoDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
