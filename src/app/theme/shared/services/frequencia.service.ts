import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from "src/app/app-config";
import { FrequenciaDTO } from "../models/frequencia.dto";


@Injectable()
export class FrequenciaService {

  private apiPath: string = `${API_CONFIG.baseUrl}/frequencias`;

  constructor(public http: HttpClient) {
  }

  atualizarFrequencias(lista: FrequenciaDTO[]): Observable<void> {
    return this.http.post<void>(`${this.apiPath}/salvar-e-atualizar-diario`, lista);
  }


  getByListFrequenciaFromIgreja(igrejaId: number, classeId: number, data: string) {

    return this.http.get(`${API_CONFIG.baseUrl}/frequencias/lista/?igreja=${igrejaId}&classe=${classeId}&data=${data}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
