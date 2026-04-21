import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { LancamentoDTO } from "../models/lancamento.dto";
import { API_CONFIG } from "src/app/app-config";
import { LancamentoFiltro } from "src/app/pages/financeiro/lancamento/lancamento-list-form/lancamento-list-form.component";

@Injectable({
  providedIn: 'root'
})
export class LancamentoService {

  private apiPath: string = `${API_CONFIG.baseUrl}/lancamentos`;

  constructor(
    public http: HttpClient) {
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
    if (filtro.dtinicio) { params = params.set('dtinicio', filtro.dtinicio); }
    if (filtro.dtfim) { params = params.set('dtfim', filtro.dtfim); }
    if (filtro.setorId) { params = params.set('setor', filtro.setorId); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/page`, { headers, params })
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
    if (filtro.dtinicio) { params = params.set('dtinicio', filtro.dtinicio); }
    if (filtro.dtfim) { params = params.set('dtfim', filtro.dtfim); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/soma-total-receita`, { headers, params })
      .pipe(
        catchError(this.handleError)
      );
  }


  getTotalOfertasAlcadas(filtro: LancamentoFiltro) {
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
    if (filtro.dtinicio) { params = params.set('dtinicio', filtro.dtinicio); }
    if (filtro.dtfim) { params = params.set('dtfim', filtro.dtfim); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/soma-oferta-alcadas`, { headers, params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getTotalGeralDebitoFromIgreja(filtro: LancamentoFiltro) { // tipoLancamento 'Despesa' é atribuida no back-end 
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
    if (filtro.dtinicio) { params = params.set('dtinicio', filtro.dtinicio); }
    if (filtro.dtfim) { params = params.set('dtfim', filtro.dtfim); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/soma-total-debito`, { headers, params })
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
    if (filtro.dtinicio) { params = params.set('dtinicio', filtro.dtinicio); }
    if (filtro.dtfim) { params = params.set('dtfim', filtro.dtfim); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/ofertas`, { headers, params })
      .pipe(
        catchError(this.handleError)
      );
  }

   getTotalDiversosFromIgreja(filtro: LancamentoFiltro) {
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
    if (filtro.dtinicio) { params = params.set('dtinicio', filtro.dtinicio); }
    if (filtro.dtfim) { params = params.set('dtfim', filtro.dtfim); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/diversos`, { headers, params })
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
    if (filtro.dtinicio) { params = params.set('dtinicio', filtro.dtinicio); }
    if (filtro.dtfim) { params = params.set('dtfim', filtro.dtfim); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/missoes`, { headers, params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getTotalRDSaldoAnteriorFromIgreja(igrejaId: number, data: string) {
    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/saldo-anterior?igreja=${igrejaId}&data=${data}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getTotalReceitaDizimoFromIgreja(filtro: LancamentoFiltro) {
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
    if (filtro.dtinicio) { params = params.set('dtinicio', filtro.dtinicio); }
    if (filtro.dtfim) { params = params.set('dtfim', filtro.dtfim); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/receita-dizimo`, { headers, params })
      .pipe(
        catchError(this.handleError)
      );
  }

  gerarRelatorioPdf(filtro: LancamentoFiltro): Observable<Blob> {
    let params = new HttpParams()
      .set('igreja', filtro.igrejaId.toString())
      .set('dtinicio', filtro.dtinicio)
      .set('dtfim', filtro.dtfim)
      .set('nome', filtro.nome || '')
      .set('tipoLancamento', filtro.tipoLancamento || '');

    // Adiciona as listas de IDs se existirem
    if (filtro.contas) params = params.set('contas', filtro.contas);
    if (filtro.formas) params = params.set('formas', filtro.formas);
    if (filtro.categorias) params = params.set('categorias', filtro.categorias);

    // É fundamental informar ao Angular que o retorno é um arquivo binário (Blob)
    return this.http.get(`${API_CONFIG.baseUrl}/relatorios/relatorio-pdf`,
      {
        params, responseType: 'blob'
      });
  }

  getSaldoFinalContasFromIgreja(igrejaId: any) {
    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/saldocontas/?igreja=${igrejaId}`)
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
