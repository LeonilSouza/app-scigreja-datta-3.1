import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { LancamentoDTO } from "../models/lancamento.dto";
import { API_CONFIG } from "src/app/app-config";
import { LancamentoFiltro } from "src/app/pages/financeiro/lancamento/lancamento-list-form/lancamento-list-form.component";
import { TotaisDTO } from "../models/totais.dto";

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

  uploadComprovante(lancamentoId: number, arquivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo, arquivo.name);

    return this.http.put(`${API_CONFIG.baseUrl}/lancamentos/${lancamentoId}/comprovante`, formData);
  }

  baixarComprovante(lancamentoId: number): Observable<Blob> {
    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/${lancamentoId}/comprovante`, {
      responseType: 'blob' // ESSENCIAL para o Angular aceitar arquivos binários
    });
  }

  getTotaisFromIgreja(filtro: LancamentoFiltro): Observable<TotaisDTO> {
    return this.http.get<TotaisDTO>(`${API_CONFIG.baseUrl}/lancamentos/totais`, {
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

  deletarComprovante(lancamentoId: number): Observable<any> {
    return this.http.delete(`${API_CONFIG.baseUrl}/lancamentos/${lancamentoId}/comprovante`);
  }

  // Estatisticas
  buscarFaturamentoMensal(igrejaId: number, setorId?: number): Observable<any[]> {
    let params = new HttpParams().set('igreja', igrejaId.toString());

    if (setorId) {
      params = params.set('setorId', setorId.toString());
    }

    return this.http.get<any[]>(`${API_CONFIG.baseUrl}/lancamentos/dashboard/faturamento-mensal`, { params });
  }

  // Estatisticas
  buscarGastosPorCategoria(filtro: any): Observable<any[]> {
    let params = new HttpParams()
      .set('igreja', filtro.igrejaId.toString())
      .set('dtinicio', filtro.dtinicio)
      .set('dtfim', filtro.dtfim);

    if (filtro.setorId) {
      params = params.set('setorId', filtro.setorId.toString());
    }

    return this.http.get<any[]>(`${API_CONFIG.baseUrl}/lancamentos/dashboard/gastos-por-categoria`, { params });
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
    if (filtro.centroCustos) { params = params.set('centroCustos', filtro.centroCustos); }
    if (filtro.tipoLancamento) { params = params.set('tipoLancamento', filtro.tipoLancamento); }
    if (filtro.dtinicio) { params = params.set('dtinicio', filtro.dtinicio); }
    if (filtro.dtfim) { params = params.set('dtfim', filtro.dtfim); }
    if (filtro.setorId) { params = params.set('setor', filtro.setorId); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos/page`, { headers, params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // MODELO USANDO  A SEGUNDA FABRICA - (ESTATICA/CONSOLIDADA) 
  // MODELO PARA GERAÇÃO DE RELATORIOS - PASSANDO NOME DO RELATORIO
  gerarLivroCaixaSimplificado(
    filtro: LancamentoFiltro,
    nomeRelatorio: string
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('nomeRelatorio', nomeRelatorio)
      .set('igreja', filtro.igrejaId.toString())
      .set('dtinicio', filtro.dtinicio)
      .set('dtfim', filtro.dtfim)
      .set('nome', filtro.nome || '');

    return this.http.get(`${API_CONFIG.baseUrl}/relatorios/gerar-pdf-consolidado`, {
      params,
      responseType: 'blob'
    });
  }

  // MODELO USANDO  A SEGUNDA FABRICA - (ESTATICA/CONSOLIDADA) 
  // MODELO PARA GERAÇÃO DE RELATORIOS - PASSANDO NOME DO RELATORIO
  gerarLivroCaixaDetalhado(
    filtro: LancamentoFiltro,
    nomeRelatorio: string
  ): Observable<Blob> {
    let params = new HttpParams()
      .set('nomeRelatorio', nomeRelatorio)
      .set('igreja', filtro.igrejaId.toString())
      .set('dtinicio', filtro.dtinicio)
      .set('dtfim', filtro.dtfim)
      .set('nome', filtro.nome || '');

    return this.http.get(`${API_CONFIG.baseUrl}/relatorios/gerar-pdf-consolidado`, {
      params,
      responseType: 'blob'
    });
  }

  // MODELO USANDO PRIMEIRA FABRICA - (DINÂMICA)  
  // MODELO DE GERAÇÃO DE RELATORIOS QUE FORAM FILTRADO NA GRID - PASSANDO NOME DO RELATORIO
  gerarMovimentacaoFinanceiraPdf(filtro: LancamentoFiltro, nomeRelatorio: string): Observable<Blob> {
    let params = new HttpParams()
      .set('nomeRelatorio', nomeRelatorio) // O Java espera 'nomeRelatorio' para carregar o .jasper
      .set('igreja', filtro.igrejaId.toString())
      .set('setorId', filtro.setorId.toString())
      .set('dtinicio', filtro.dtinicio)
      .set('dtfim', filtro.dtfim)
      .set('nome', filtro.nome || '')
      .set('tipoLancamento', filtro.tipoLancamento || '')
    // Adiciona as listas de IDs (que o Java usa na Specification)
    if (filtro.contas) params = params.set('contas', filtro.contas);
    if (filtro.formas) params = params.set('formas', filtro.formas);
    if (filtro.categorias) params = params.set('categorias', filtro.categorias);
    if (filtro.centroCustos) params = params.set('centroCustoIds', filtro.centroCustos);

    return this.http.get(`${API_CONFIG.baseUrl}/relatorios/gerar-pdf-dinamico`, { //endpoint Primeira Fabrica de relatorios basta criar o relatorio no jasper e passar o nome aqui
      params,
      responseType: 'blob'
    });
  }

  //Separado
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
