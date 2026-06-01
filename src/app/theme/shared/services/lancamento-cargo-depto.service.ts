import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/app/app-config';
import { LancamentoCargoFiltro } from 'src/app/pages/lancamento-cargo-depto/lancamento-cargo-list-form/lancamento-cargo-depto-list-form.component';
import { LancamentoCargoDeptoDTO } from '../models/lancamento-cargo-depto.dto';

@Injectable({
  providedIn: 'root'
})
export class LancamentoCargoDeptoService {

  private readonly apiPath = `${API_CONFIG.baseUrl}/lancamentos-cargos-deptos`;

  constructor(private http: HttpClient) { }

  // 1. BUSCAR POR ID
  findById(id: number): Observable<LancamentoCargoDeptoDTO> {
    return this.http.get<LancamentoCargoDeptoDTO>(`${this.apiPath}/${id}`);
  }

  // 2. INSERIR NOVO CARGO
  create(obj: LancamentoCargoDeptoDTO): Observable<any> {
    return this.http.post(this.apiPath, obj, {
      observe: 'response',
      responseType: 'text'
    });
  }

  // 3. ATUALIZAR REGISTRO
  update(lancamentoCargo: LancamentoCargoDeptoDTO): Observable<LancamentoCargoDeptoDTO> {
    return this.http.put(`${this.apiPath}/${lancamentoCargo.id}`, lancamentoCargo,);
  }

  // 4. DELETAR REGISTRO
  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiPath}/${id}`);
  }

  getPageLancamentoCargoFromIgreja(filtro: LancamentoCargoFiltro) {
    const headers = new HttpHeaders()
    let params = new HttpParams()
      .set('page', filtro.page)
      .set('linesPerPage', filtro.linesPerPage);

    // Se o usuário selecionou filtros na tela, anexa na requisição do Java
    if (filtro.igrejaId) params = params.set('igreja', filtro.igrejaId.toString());
    if (filtro.departamentoId) params = params.set('departamento', filtro.departamentoId.toString());
    if (filtro.cargoId) params = params.set('cargo', filtro.cargoId.toString());
    if (filtro.setorId) { params = params.set('setor', filtro.setorId); }

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentos-cargos-deptos/page`, { headers, params })
  }

  // Método para obter os bytes do PDF gerado pelo Jasper
  imprimirCargosDepto(filtro: { igrejaId?: number; departamentoId?: number; cargoId?: number }): Observable<Blob> {
    let params = new HttpParams();

    // Anexa os filtros dinâmicos se estiverem selecionados na tela
    if (filtro.igrejaId) params = params.set('igreja', filtro.igrejaId.toString());
    if (filtro.departamentoId) params = params.set('departamento', filtro.departamentoId.toString());
    if (filtro.cargoId) params = params.set('cargo', filtro.cargoId.toString());

    // O pulo do gato: informamos 'blob' para o Angular aceitar o fluxo binário do PDFBox
    return this.http.get(`${API_CONFIG.baseUrl}/relatorios/cargos-departamentos`, {
      params,
      responseType: 'blob'
    });
  }

}