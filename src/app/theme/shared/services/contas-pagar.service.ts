import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { API_CONFIG } from "src/app/app-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { ContasPagarDTO, ContasPagarResumoDTO } from "../models/contas-pagar.dto";

@Injectable()
export class ContasPagarService {

  private apiPath: string = `${API_CONFIG.baseUrl}/contas-pagar`;

  constructor(public http: HttpClient) { }

  findAll(): Observable<ContasPagarDTO[]> {
    return this.http.get<ContasPagarDTO[]>(this.apiPath)
      .pipe(catchError(this.handleError));
  }

  findById(id: number): Observable<ContasPagarDTO> {
    return this.http.get<ContasPagarDTO>(`${this.apiPath}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ── BUSCA PAGINADA — parâmetro renomeado para "busca" ──
  getByPageContasPagarFromIgreja(
    igrejaId: number,
    busca: string,
    dtInicio: string,
    dtFim: string,
    page: number,
    linesPerPage: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('busca', busca)          // ← era 'nome', agora 'busca'
      .set('dataInicio', dtInicio)
      .set('dataFim', dtFim)
      .set('page', page)
      .set('linesPerPage', linesPerPage);

    return this.http.get(
      `${this.apiPath}/page/?igreja=${igrejaId}`, { params }
    ).pipe(catchError(this.handleError));
  }

  // ── RESUMO — parâmetro renomeado para "busca" ──
  getResumoContasPagarFromIgreja(
    igrejaId: number,
    busca: string,
    dtInicio: string,
    dtFim: string
  ): Observable<ContasPagarResumoDTO> {
    const params = new HttpParams()
      .set('busca', busca)          // ← era 'nome', agora 'busca'
      .set('dtInicio', dtInicio)
      .set('dtFim', dtFim);

    return this.http.get<ContasPagarResumoDTO>(
      `${this.apiPath}/resumo/?igreja=${igrejaId}`, { params }
    ).pipe(catchError(this.handleError));
  }

  create(contasPagar: any): Observable<any> {
    return this.http.post(
      this.apiPath,
      contasPagar,
      { observe: 'response', responseType: 'text' }
    );
  }

  update(contasPagar: ContasPagarDTO): Observable<ContasPagarDTO> {
    return this.http.put(`${this.apiPath}/${contasPagar.id}`, contasPagar)
      .pipe(
        catchError(this.handleError),
        map(() => contasPagar)
      );
  }

  baixarPagamento(id: number, data?: string, valor?: string): Observable<any> {
    const params: any = {};
    if (data)  params['dataPagamento'] = data;
    if (valor) params['valorPago'] = valor;

    return this.http.put(
      `${this.apiPath}/baixar-pagamento/${id}`, {}, { params }
    ).pipe(catchError(this.handleError));
  }

  estornarPagamento(id: number): Observable<any> {
    return this.http.put(
      `${this.apiPath}/estornar-pagamento/${id}`, {}
    ).pipe(catchError(this.handleError));
  }

  delete(id: number, apagarGrupo: boolean): Observable<any> {
    const params = new HttpParams()
      .set('apagarGrupo', apagarGrupo);

    return this.http.delete(`${this.apiPath}/${id}`, { params })
      .pipe(
        catchError(this.handleError),
        map(() => null)
      );
  }

  private handleError(error: any): Observable<any> {
    console.error("ERRO NA REQUISIÇÃO => ", error);
    return throwError(() => error);
  }
}
