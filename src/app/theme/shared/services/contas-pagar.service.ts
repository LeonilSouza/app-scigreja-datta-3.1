import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { API_CONFIG } from "src/app/app-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { ContasPagarDTO } from "../models/contas-pagar.dto";

@Injectable()
export class ContasPagarService {

  private apiPath: string = `${API_CONFIG.baseUrl}/contas-pagar`;

  constructor(public http: HttpClient) {
  }

  findAll(): Observable<ContasPagarDTO> {
    return this.http.get<ContasPagarDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError));
  }

  findById(id: number): Observable<ContasPagarDTO> {

    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      // map(this.jsonDataToContasPagarDepto)
    )
  }

  getByPageContasPagarFromIgreja(igrejaId, dtInicio, dtFim, page, linesPerPage) {
     const params = new HttpParams()
      .set('dataInicio', dtInicio)
      .set('dataFim', dtFim)
      .set('page', page)
      .set('linesPerPage', linesPerPage);

    return this.http.get(`${API_CONFIG.baseUrl}/contas-pagar/page/?igreja=${igrejaId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  gerarParcelas(contaMestre: any, quantidadeParcelas: number): Observable<any> {
    const payload = {
      contaMestre: contaMestre,
      quantidadeParcelas: quantidadeParcelas
    };
    console.log(payload)
    return this.http.post(`${this.apiPath}/gerar-parcelas`, payload);
  }


  create(ContasPagar: ContasPagarDTO) {
    return this.http.post(this.apiPath,
      ContasPagar,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(ContasPagarDepto: ContasPagarDTO): Observable<ContasPagarDTO> {
    const url = `${this.apiPath}/${ContasPagarDepto.id}`;

    return this.http.put(url, ContasPagarDepto)
      .pipe(
        // map(this.jsonDataToContasPagarDepto),
        catchError(this.handleError),
        //map(this.jsonDataToContasPagarDeptoFuncao)
        map(() => ContasPagarDepto)
      )
  }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  // private jsonDataToContasPagarDepto(jsonData: any): ContasPagarDTO {
  //   return (new ContasPagarDTO(), jsonData);
  // }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
