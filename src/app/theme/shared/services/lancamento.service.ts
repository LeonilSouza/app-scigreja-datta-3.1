import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { LancamentoDTO } from "../models/lancamento.dto";
import { LancamentoFiltro } from "../pages/financeiro/lancamento/lancamento-list-form/lancamento-list-form.component";

@Injectable({
  providedIn: 'root'
})
export class LancamentoService {

  private apiPath: string = `${API_CONFIG.baseUrl}/lancamentos`;

  constructor(
    public http: HttpClient) {
  }

  findAll(): Observable<LancamentoDTO> {
    return this.http.get<LancamentoDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError));
  }

  findById(id: number): Observable<LancamentoDTO> {

    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToLancamento)
    )
  }


  getPageLancamentoFromIgreja(filtro: LancamentoFiltro) {
    const headers = new HttpHeaders()
    let params = new HttpParams()
      .set('page', filtro.page)
      .set('linesPerPage', filtro.linesPerPage);

    if (filtro.nome) { params = params.set('nome', filtro.nome); }
    if (filtro.igrejaId) { params = params.set('igreja', filtro.igrejaId); }
    if (filtro.contas) { params = params.set('contas', filtro.contas); }
    if (filtro.formas) { params = params.set('formas', filtro.formas); }
    if (filtro.categorias) { params = params.set('categorias', filtro.categorias); }
    if (filtro.tipoLancamento) { params = params.set('tipoLancamento', filtro.tipoLancamento); }
    if (filtro.dtInicio) { params = params.set('dtinicio', filtro.dtInicio); }
    if (filtro.dtFim) { params = params.set('dtfim', filtro.dtFim); }
    if (filtro.setorId) { params = params.set('setor', filtro.setorId); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/page`, { headers, params })
      .pipe(
        catchError(this.handleError)
      );
  }


  getTotalReceitaFromIgreja(filtro: LancamentoFiltro) {
    const headers = new HttpHeaders()
    let params = new HttpParams()
      .set('page', filtro.page)
      .set('linesPerPage', filtro.linesPerPage);

    if (filtro.nome) { params = params.set('nome', filtro.nome); }
    if (filtro.igrejaId) { params = params.set('igreja', filtro.igrejaId); }
    if (filtro.contas) { params = params.set('contas', filtro.contas); }
    if (filtro.formas) { params = params.set('formas', filtro.formas); }
    if (filtro.categorias) { params = params.set('categorias', filtro.categorias); }
    if (filtro.tipoLancamento) { params = params.set('tipoLancamento', filtro.tipoLancamento); }
    if (filtro.dtInicio) { params = params.set('dtinicio', filtro.dtInicio); }
    if (filtro.dtFim) { params = params.set('dtfim', filtro.dtFim); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/somareceita`, { headers, params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getTotalDespesaFromIgreja(filtro: LancamentoFiltro) {
    const headers = new HttpHeaders()
    let params = new HttpParams()
      .set('page', filtro.page)
      .set('linesPerPage', filtro.linesPerPage);

    if (filtro.nome) { params = params.set('nome', filtro.nome); }
    if (filtro.igrejaId) { params = params.set('igreja', filtro.igrejaId); }
    if (filtro.contas) { params = params.set('contas', filtro.contas); }
    if (filtro.formas) { params = params.set('formas', filtro.formas); }
    if (filtro.categorias) { params = params.set('categorias', filtro.categorias); }
    if (filtro.tipoLancamento) { params = params.set('tipoLancamento', filtro.tipoLancamento); }
    if (filtro.dtInicio) { params = params.set('dtinicio', filtro.dtInicio); }
    if (filtro.dtFim) { params = params.set('dtfim', filtro.dtFim); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/somadespesa`, { headers, params })
      .pipe(
        catchError(this.handleError)
      );
  }


  getTotalGeralCreditoFromIgreja(filtro: LancamentoFiltro) {
    const headers = new HttpHeaders()
    let params = new HttpParams()
      .set('page', filtro.page)
      .set('linesPerPage', filtro.linesPerPage);

    if (filtro.nome) { params = params.set('nome', filtro.nome); }
    if (filtro.igrejaId) { params = params.set('igreja', filtro.igrejaId); }
    if (filtro.contas) { params = params.set('contas', filtro.contas); }
    if (filtro.formas) { params = params.set('formas', filtro.formas); }
    if (filtro.categorias) { params = params.set('categorias', filtro.categorias); }
    if (filtro.tipoLancamento) { params = params.set('tipoLancamento', filtro.tipoLancamento); }
    if (filtro.dtInicio) { params = params.set('dtinicio', filtro.dtInicio); }
    if (filtro.dtFim) { params = params.set('dtfim', filtro.dtFim); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/soma_total_credito`, { headers, params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getTotalGeralDebitoFromIgreja(filtro: LancamentoFiltro) {
    const headers = new HttpHeaders()
    let params = new HttpParams()
      .set('page', filtro.page)
      .set('linesPerPage', filtro.linesPerPage);

    if (filtro.nome) { params = params.set('nome', filtro.nome); }
    if (filtro.igrejaId) { params = params.set('igreja', filtro.igrejaId); }
    if (filtro.contas) { params = params.set('contas', filtro.contas); }
    if (filtro.formas) { params = params.set('formas', filtro.formas); }
    if (filtro.categorias) { params = params.set('categorias', filtro.categorias); }
    if (filtro.tipoLancamento) { params = params.set('tipoLancamento', filtro.tipoLancamento); }
    if (filtro.dtInicio) { params = params.set('dtinicio', filtro.dtInicio); }
    if (filtro.dtFim) { params = params.set('dtfim', filtro.dtFim); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/soma_total_debito`, { headers, params })
      .pipe(
        catchError(this.handleError)
      );
  }



  getTotalOfertasFromIgreja(filtro: LancamentoFiltro) {
    const headers = new HttpHeaders()
    let params = new HttpParams()
      .set('page', filtro.page)
      .set('linesPerPage', filtro.linesPerPage);

    if (filtro.nome) { params = params.set('nome', filtro.nome); }
    if (filtro.igrejaId) { params = params.set('igreja', filtro.igrejaId); }
    if (filtro.contas) { params = params.set('contas', filtro.contas); }
    if (filtro.formas) { params = params.set('formas', filtro.formas); }
    if (filtro.categorias) { params = params.set('categorias', filtro.categorias); }
    if (filtro.tipoLancamento) { params = params.set('tipoLancamento', filtro.tipoLancamento); }
    if (filtro.dtInicio) { params = params.set('dtinicio', filtro.dtInicio); }
    if (filtro.dtFim) { params = params.set('dtfim', filtro.dtFim); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/ofertas`, { headers, params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getTotalMissoesFromIgreja(filtro: LancamentoFiltro) {
    const headers = new HttpHeaders()
    let params = new HttpParams()
      .set('page', filtro.page)
      .set('linesPerPage', filtro.linesPerPage);

    if (filtro.nome) { params = params.set('nome', filtro.nome); }
    if (filtro.igrejaId) { params = params.set('igreja', filtro.igrejaId); }
    if (filtro.contas) { params = params.set('contas', filtro.contas); }
    if (filtro.formas) { params = params.set('formas', filtro.formas); }
    if (filtro.categorias) { params = params.set('categorias', filtro.categorias); }
    if (filtro.tipoLancamento) { params = params.set('tipoLancamento', filtro.tipoLancamento); }
    if (filtro.dtInicio) { params = params.set('dtinicio', filtro.dtInicio); }
    if (filtro.dtFim) { params = params.set('dtfim', filtro.dtFim); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/missoes`, { headers, params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getTotalRDSaldoAnteriorFromIgreja(igrejaId, data) {
    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/saldoanterior?igreja=${igrejaId}&data=${data}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getTotalReceitaDizimOfertaFromIgreja(igrejaId, dtinicio, dtfim) {
    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/receitadizimoferta?igreja=${igrejaId}&dtinicio=${dtinicio}&dtfim=${dtfim}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getSaldoFinalContasFromIgreja(igrejaId) {
    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/saldocontas/?igreja=${igrejaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getListLancamentoFromIgreja(igrejaId) {

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/list/?igreja=${igrejaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  create(lancamento: LancamentoDTO) {
    return this.http.post(this.apiPath,
      lancamento,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(lancamento: LancamentoDTO): Observable<LancamentoDTO> {
    const url = `${this.apiPath}/${lancamento.id}`;

    return this.http.put(url, lancamento)
      .pipe(
        map(this.jsonDataToLancamento),
        catchError(this.handleError),
        //map(this.jsonDataToLancamentoFuncao)
        map(() => lancamento)
      )
  }

  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  private jsonDataToLancamento(jsonData: any): LancamentoDTO {
    return (new LancamentoDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
