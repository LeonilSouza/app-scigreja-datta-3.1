import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { API_CONFIG } from "src/app/app-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { ContasPagarDTO } from "../models/contas-pagar.dto";

@Injectable()
export class ContasPagarService {

  private apiPath: string = `${API_CONFIG.baseUrl}/contas-pagar`;
  // private apiPath2: string = `${API_CONFIG.baseUrl}/baixar-pagamento`;

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

    )
  }

   getResumoContasPagarFromIgreja(igrejaId: number, nome: string | number | boolean | undefined, dtInicio: string | number | boolean, dtFim: string | number | boolean) {
    const params = new HttpParams()
      .set('nome', nome!)
      .set('dtInicio', dtInicio)
      .set('dtFim', dtFim);

    return this.http.get(`${API_CONFIG.baseUrl}/contas-pagar/resumo/?igreja=${igrejaId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getByPageContasPagarFromIgreja(igrejaId: number, nome: string | number | boolean, dtInicio: string | number | boolean, dtFim: string | number | boolean, page: string | number | boolean, linesPerPage: string | number | boolean) {
    const params = new HttpParams()
      .set('nome', nome)
      .set('dataInicio', dtInicio)
      .set('dataFim', dtFim)
      .set('page', page)
      .set('linesPerPage', linesPerPage);

    return this.http.get(`${API_CONFIG.baseUrl}/contas-pagar/page/?igreja=${igrejaId}`, { params })
      .pipe(
        catchError(this.handleError)
      );
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

  baixarPagamento(id: number, data?: string, valor?: string ): Observable<any> {
    // data deve estar no formato dd/MM/yyyy se enviado
    const url = `${this.apiPath}/baixar-pagamento/${id}`;
    const params = data ? { params: { dataPagamento: data,  valorPago: valor }  } : {};
    return this.http.put(url, {}, (params as any));
  }

  update(contasPagar: ContasPagarDTO): Observable<ContasPagarDTO> {
    const url = `${this.apiPath}/${contasPagar.id}`;

    return this.http.put(url, contasPagar)
      .pipe(
        catchError(this.handleError),
        map(() => contasPagar)
      )
  }


  delete(id: number, apagarGrupo: boolean): Observable<any> {
    const params = new HttpParams()
      .set('apagarGrupo', apagarGrupo);

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url, { params })
    .pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }

  estornarPagamento(id: number): Observable<any> {

    const url = `${this.apiPath}/estornar-pagamento/${id}`;

    return this.http.put(`${this.apiPath}/estornar-pagamento/${id}`, {});
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
