import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { LancamentoDTO } from "../models/lancamento.dto";
import { API_CONFIG } from "src/app/app-config";
import { LancamentoFiltro } from "src/app/pages/financeiro/lancamento/lancamento-list-form/lancamento-list-form.component";
import { TotaisDTO } from "../models/totais.dto";
import { RelatorioCentroCusto } from "../models/relatorio-centro-custo.dto";

@Injectable({
  providedIn: 'root'
})
export class LancamentoService {
  private apiPath: string = `${API_CONFIG.baseUrl}/lancamentos`;
  private apiPath2: string = `${API_CONFIG.baseUrl}/relatorios/centro-custo`;

  constructor(public http: HttpClient) { }

  // ════════════════════════════════════════════════════
  // RELATÓRIOS — SINTÉTICO
  // ════════════════════════════════════════════════════

  gerarRelatorioSintetico(filtro: LancamentoFiltro): Observable<Blob> {
    let params = new HttpParams()
      .set('igreja', filtro.igrejaId.toString())
      .set('dtinicio', filtro.dtinicio)
      .set('dtfim', filtro.dtfim)
      .set('setorId', filtro.setorId.toString());

    if (filtro.tipoLancamento) params = params.set('tipo', filtro.tipoLancamento);
    if (filtro.contas && filtro.contas.length > 0) {
      filtro.contas.split(',').forEach(id => {
        params = params.append('contaId', id.trim());
      });
    }

    return this.http.get(`${API_CONFIG.baseUrl}/relatorios/gerar-pdf-sintetico`,
      { params, responseType: 'blob' });
  }

  gerarRelatorioSinteticoExcel(filtro: LancamentoFiltro): Observable<Blob> {
    let params = new HttpParams()
      .set('igreja', filtro.igrejaId.toString())
      .set('dtinicio', filtro.dtinicio)
      .set('dtfim', filtro.dtfim)
      .set('setorId', filtro.setorId.toString());

    if (filtro.tipoLancamento) params = params.set('tipo', filtro.tipoLancamento);
    if (filtro.contaId) params = params.set('contaId', filtro.contas);

    return this.http.get(`${API_CONFIG.baseUrl}/relatorios/gerar-excel-sintetico`,
      { params, responseType: 'blob' });
  }

  // ════════════════════════════════════════════════════
  // RELATÓRIOS — ANALÍTICO
  // ════════════════════════════════════════════════════

  gerarRelatorioAnaliticoPdf(filtro: LancamentoFiltro): Observable<Blob> {
    const params = this.montarParamsAnalitico(filtro);
    return this.http.get(`${API_CONFIG.baseUrl}/relatorios/gerar-pdf-analitico`,
      { params, responseType: 'blob' });
  }

  gerarRelatorioAnaliticoExcel(filtro: LancamentoFiltro): Observable<Blob> {
    const params = this.montarParamsAnalitico(filtro);
    return this.http.get(`${API_CONFIG.baseUrl}/relatorios/gerar-excel-analitico`,
      { params, responseType: 'blob' });
  }

  private montarParamsAnalitico(filtro: LancamentoFiltro): HttpParams {
    let params = new HttpParams()
      .set('igreja', filtro.igrejaId.toString())
      .set('dtinicio', filtro.dtinicio)
      .set('dtfim', filtro.dtfim)


    // ✅ Só adiciona se tiver valor real
    if (filtro.setorId) params = params.set('setorId', filtro.setorId.toString());
    if (filtro.nome) params = params.set('nome', filtro.nome);

    if (filtro.tipoLancamento) params = params.set('tipo', filtro.tipoLancamento);
    if (filtro.contaId) params = params.set('contaId', filtro.contaId.toString());

    filtro.categoriasIds?.forEach(id => params = params.append('categorias', id.toString()));
    filtro.formasIds?.forEach(id => params = params.append('formas', id.toString()));
    // filtro.centroCustoIds?.forEach(id => params = params.append('centroCustos',  id.toString()));
    return params;
  }

  // ════════════════════════════════════════════════════
  // DEMAIS MÉTODOS 
  // ════════════════════════════════════════════════════

  findById(id: number): Observable<LancamentoDTO> {
    return this.http.get(`${this.apiPath}/${id}`).pipe(
      catchError(this.handleError),
      map(this.jsonDataToLancamento)
    );
  }

  // Usado no Contas a Pagar
  uploadComprovante(lancamentoId: number, arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo, arquivo.name);
    return this.http.put(`${this.apiPath}/${lancamentoId}/comprovante`, formData);
  }

  baixarComprovante(lancamentoId: number): Observable<Blob> {
    return this.http.get(`${this.apiPath}/${lancamentoId}/comprovante`, { responseType: 'blob' });
  }

  // relatorio-cc-periodo.service.ts
  gerarPdfPeriodo(
    igrejaId: number,
    setorId: number,
    dataInicio: string,
    dataFim: string,
    centrosCustoIds: number[],
    contasIds: number[],
    categoriasIds: number[]
  ): Observable<Blob> {

    let params = new HttpParams()
      .set('igrejaId', String(igrejaId))
      .set('setorId', String(setorId))
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim);

    centrosCustoIds.forEach(id => params = params.append('centrosCustoIds', String(id)));
    contasIds.forEach(id => params = params.append('contasIds', String(id)));
    categoriasIds.forEach(id => params = params.append('categoriasIds', String(id)));

    return this.http.get(
      `${API_CONFIG.baseUrl}/relatorios/centro-custo-periodo/pdf`,
      { params, responseType: 'blob' }
    );
  }


  deletarComprovante(lancamentoId: number): Observable<any> {
    return this.http.delete(`${this.apiPath}/${lancamentoId}/comprovante`);
  }

  getTotaisFromIgreja(filtro: LancamentoFiltro): Observable<TotaisDTO> {
    return this.http.get<TotaisDTO>(`${this.apiPath}/totais`, {
      params: {
        igreja: filtro.igrejaId,
        setorId: filtro.setorId,
        nome: filtro.nome,
        contas: filtro.contas,
        dtinicio: filtro.dtinicio,
        dtfim: filtro.dtfim,
        formas: filtro.formas,
        categorias: filtro.categorias,
        centroCustos: filtro.centroCustos,
        tipoLancamento: filtro.tipoLancamento
      }
    });
  }

  buscarFaturamentoMensal(igrejaId: number, setorId?: number): Observable<any[]> {
    let params = new HttpParams().set('igreja', igrejaId.toString());
    if (setorId) params = params.set('setorId', setorId.toString());
    return this.http.get<any[]>(`${this.apiPath}/dashboard/faturamento-mensal`, { params });
  }

  buscarGastosPorCategoria(filtro: any): Observable<any[]> {
    let params = new HttpParams()
      .set('igreja', filtro.igrejaId.toString())
      .set('dtinicio', filtro.dtinicio)
      .set('dtfim', filtro.dtfim);
    if (filtro.setorId) params = params.set('setorId', filtro.setorId.toString());
    return this.http.get<any[]>(`${this.apiPath}/dashboard/gastos-por-categoria`, { params });
  }

  getPageLancamentoFromIgreja(filtro: LancamentoFiltro) {
    let params = new HttpParams()
      .set('page', filtro.page)
      .set('linesPerPage', filtro.linesPerPage);

    if (filtro.nome) params = params.set('nome', filtro.nome);
    if (filtro.igrejaId) params = params.set('igreja', filtro.igrejaId);
    if (filtro.contas) params = params.set('contas', filtro.contas);
    if (filtro.formas) params = params.set('formas', filtro.formas);
    if (filtro.categorias) params = params.set('categorias', filtro.categorias);
    if (filtro.centroCustos) params = params.set('centroCustos', filtro.centroCustos);
    if (filtro.tipoLancamento) params = params.set('tipoLancamento', filtro.tipoLancamento);
    if (filtro.dtinicio) params = params.set('dtinicio', filtro.dtinicio);
    if (filtro.dtfim) params = params.set('dtfim', filtro.dtfim);
    if (filtro.setorId) params = params.set('setor', filtro.setorId);

    return this.http.get(`${this.apiPath}/page`, { params }).pipe(catchError(this.handleError));
  }


  gerarLivroCaixaSimplificado(filtro: LancamentoFiltro, nomeRelatorio: string): Observable<Blob> {
    let params = new HttpParams()
      .set('nomeRelatorio', nomeRelatorio)
      .set('igreja', filtro.igrejaId.toString())
      .set('dtinicio', filtro.dtinicio)
      .set('dtfim', filtro.dtfim)
      .set('nome', filtro.nome || '');

    return this.http.get(`${API_CONFIG.baseUrl}/relatorios/gerar-pdf-consolidado`,
      { params, responseType: 'blob' });
  }

  gerarLivroCaixaDetalhado(filtro: LancamentoFiltro, nomeRelatorio: string): Observable<Blob> {
    let params = new HttpParams()
      .set('nomeRelatorio', nomeRelatorio)
      .set('igreja', filtro.igrejaId.toString())
      .set('dtinicio', filtro.dtinicio)
      .set('dtfim', filtro.dtfim)
      .set('nome', filtro.nome || '');

    return this.http.get(`${API_CONFIG.baseUrl}/relatorios/gerar-pdf-consolidado`,
      { params, responseType: 'blob' });
  }

  getSaldoFinalContasFromIgreja(igrejaId: any) {
    return this.http.get(`${this.apiPath}/saldocontas/?igreja=${igrejaId}`)
      .pipe(catchError(this.handleError));
  }

  create(lancamento: LancamentoDTO) {
    return this.http.post(this.apiPath, lancamento, { observe: 'response', responseType: 'text' });
  }

  update(lancamento: LancamentoDTO): Observable<LancamentoDTO> {
    return this.http.put(`${this.apiPath}/${lancamento.id}`, lancamento).pipe(
      map(this.jsonDataToLancamento),
      catchError(this.handleError),
      map(() => lancamento)
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiPath}/${id}`).pipe(
      catchError(this.handleError),
      map(() => null)
    );
  }

  private jsonDataToLancamento(jsonData: any): LancamentoDTO {
    return (new LancamentoDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }
}
