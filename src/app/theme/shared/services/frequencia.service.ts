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

  findAll(): Observable<FrequenciaDTO> {
    return this.http.get<FrequenciaDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError));
  }

   getById(id: number): Observable<FrequenciaDTO> {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      //  map(this.jsonDataToFrequencia)
    )
  }


buscarPorAula(aulaId: number, page: number = 0, linesPerPage: number = 20): Observable<PageResponse<FrequenciaResponse>> {
  return this.http.get<PageResponse<FrequenciaResponse>>(
    `${this.apiPath}/aula/${aulaId}?page=${page}&linesPerPage=${linesPerPage}`
  );
}

  getByPageFrequenciaFromIgreja(igrejaId, data, aula, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/frequencias/page/?igreja=${igrejaId}&data=${data}&aula=${aula}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getByPageTodosFrequenciaFromIgreja(igrejaId, classeId, data, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/frequencias/page/?igreja=${igrejaId}&classe=${classeId}&data=${data}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  getByPageFrequenciaFromTipo(igrejaId, nome, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/frequencias/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getListFrequenciaFromIgreja(igrejaId) {

    return this.http.get(`${API_CONFIG.baseUrl}/frequencias/list/?igreja=${igrejaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

 // Método que envia o DTO para o endpoint @PostMapping  no Spring
  registrarFrequencia(dto: FrequenciaDTO): Observable<string> {
    return this.http.post<string>(`${this.apiPath}`, dto, {
      responseType: 'text' as 'json' // Necessário se o Spring retornar String em vez de JSON
    });
  }  


  update(frequencia: FrequenciaDTO): Observable<FrequenciaDTO> {
    const url = `${this.apiPath}/${frequencia.aulaId}`;

    return this.http.put(url, frequencia)
      .pipe(
        // map(this.jsonDataToFrequencia),
        catchError(this.handleError),
        //map(this.jsonDataToFrequenciaFuncao)
        map(() => frequencia)
      )
  }


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
