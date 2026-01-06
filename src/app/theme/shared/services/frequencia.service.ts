import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from "src/app/app-config";
import { FrequenciaDTO, FrequenciaResponse } from "../models/frequencia.dto";
import { PageResponse } from "../models/page.model";


@Injectable()
export class FrequenciaService {

  private apiPath: string = `${API_CONFIG.baseUrl}/frequencias`;

  constructor(public http: HttpClient) {
  }


  getByPageTodosFrequenciaFromIgreja(igrejaId, classeId, data, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/frequencias/page/?igreja=${igrejaId}&classe=${classeId}&data=${data}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getListFrequenciaFromIgreja(igrejaId, data) {

    return this.http.get(`${API_CONFIG.baseUrl}/frequencias/list/?igreja=${igrejaId}&data=${data}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  // update(frequencia: FrequenciaDTO): Observable<FrequenciaDTO> {
  //   const url = `${this.apiPath}/${frequencia.aulaId}`;

  //   return this.http.put(url, frequencia)
  //     .pipe(
  //       // map(this.jsonDataToFrequencia),
  //       catchError(this.handleError),
  //       //map(this.jsonDataToFrequenciaFuncao)
  //       map(() => frequencia)
  //     )
  // }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  // private jsonDataToFrequencia(jsonData: any): FrequenciaDTO {
  //   return (new FrequenciaDTO(), jsonData);
  // }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
