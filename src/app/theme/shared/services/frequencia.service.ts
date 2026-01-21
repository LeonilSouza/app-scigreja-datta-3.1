import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from "src/app/app-config";
import { FiltroTrimestral, FrequenciaDTO } from "../models/frequencia.dto";


@Injectable()
export class FrequenciaService {

  private apiPath: string = `${API_CONFIG.baseUrl}/frequencias`;
  private apiPathRelatorios: string = `${API_CONFIG.baseUrl}/relatorios`;

  constructor(public http: HttpClient) {
  }

  atualizarFrequencias(lista: FrequenciaDTO[]): Observable<void> {
  return this.http.post<void>(`${this.apiPath}/salvar-e-atualizar-diario`, lista);
}


  getByListFrequenciaFromIgreja(igrejaId, classeId, data) {

    return this.http.get(`${API_CONFIG.baseUrl}/frequencias/lista/?igreja=${igrejaId}&classe=${classeId}&data=${data}`)
      .pipe(
        catchError(this.handleError)
      );
  }

   imprimirChamadaTrimestral(filtro: FiltroTrimestral): Observable<Blob> {
  // O Java agora espera um objeto no corpo (POST)
  return this.http.post(`${this.apiPathRelatorios}/chamada-trimestral`, filtro, {
    responseType: 'blob' // Essencial para receber o PDF (binário)
  });
}

//  imprimirChamadaTrimestral(filtro: FiltroTrimestral): void {
//   // Construímos a URL com os parâmetros para o Jasper
//   const url = `${this.apiPathRelatorios}/chamada-trimestral?` +
//               `igrejaId=${filtro.igrejaId}&` +
//               `classeId=${filtro.classeId}&` +
//               `ano=${filtro.ano}&` +
//               `trimestre=${filtro.trimestre}`;

//   // Abre o PDF gerado pelo Java em uma nova aba
//   window.open(url, '_blank');
// }


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
