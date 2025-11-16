import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from "src/app/app-config";
import { DatasDTO } from "../models/datas.dto";

@Injectable()
export class DatasService {

    private apiPath: string = `${API_CONFIG.baseUrl}/datas`;

    constructor(public http: HttpClient) {
    }

    findAll(): Observable<DatasDTO> {
        return this.http.get<DatasDTO>(this.apiPath)
        .pipe(
          catchError(this.handleError));
      }

    findById(id: number): Observable<DatasDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToDatas)
        )
      }

      getByPageDatasFromIgreja(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/datas/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getByPageDatasFromTipo(igrejaId, nome, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/datas/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

      getListDatasFromIgreja(igrejaId) {

        return this.http.get(`${API_CONFIG.baseUrl}/datas/list/?igreja=${igrejaId}`)
          .pipe(
            catchError(this.handleError)
        );
      }


     create(data : DatasDTO) {
      return this.http.post(this.apiPath,
        data,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(data: DatasDTO): Observable<DatasDTO> {
        const url = `${this.apiPath}/${data.id}`;

        return this.http.put(url, data)
          .pipe(
           map(this.jsonDataToDatas),
           catchError(this.handleError),
           //map(this.jsonDataToDatasFuncao)
           map(() => data)
        )
      }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }


      private jsonDataToDatas(jsonData: any): DatasDTO {
        return (new DatasDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

}
