import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from "src/app/app-config";
import { LancamentoEbdDTO } from "../models/lancamento-ebd.dto";


@Injectable()
export class LancamentoEbdService {

  private apiPath: string = `${API_CONFIG.baseUrl}/lancamentoebds`;

  constructor(public http: HttpClient) {
  }

  findAll(): Observable<LancamentoEbdDTO> {
    return this.http.get<LancamentoEbdDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError));
  }

   getById(id: number): Observable<LancamentoEbdDTO> {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
       map(this.jsonDataToLancamentoEbd)
    )
  }

  getByPageLancamentoEbdFromIgreja(igrejaId, classeId, data, frequencia, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentoebds/page/?igreja=${igrejaId}&classe=${classeId}&data=${data}&frequencia=${frequencia}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getByPageTodosLancamentoEbdFromIgreja(igrejaId, classeId, data, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentoebds/page/todos/?igreja=${igrejaId}&classe=${classeId}&data=${data}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  getByPageLancamentoEbdFromTipo(igrejaId, nome, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentoebds/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getListLancamentoEbdFromIgreja(igrejaId) {

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentoebds/list/?igreja=${igrejaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }
  
  verificarDataLancamento(igrejaId, data) {

    return this.http.get(`${API_CONFIG.baseUrl}/lancamentoebds/verificarData/?igreja=${igrejaId}&data=${data}`)
      .pipe(
        catchError(this.handleError)
      );
  }

   /**
   * Envia o array de lançamentos para o backend via POST.
   * @param lancamentos O array de objetos a ser enviado.
   * @returns Um Observable com a resposta do servidor.
   */
  salvarLancamentos(lancamentos: any[]): Observable<any> {
    // O Angular/HttpClient automaticamente serializa o array para JSON
    return this.http.post<any>(this.apiPath, lancamentos);
  }


  create(lancamentoEbd: LancamentoEbdDTO) {
    return this.http.post(this.apiPath,
      lancamentoEbd,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(lancamentoEbd: LancamentoEbdDTO): Observable<LancamentoEbdDTO> {
    const url = `${this.apiPath}/${lancamentoEbd.id}`;

    return this.http.put(url, lancamentoEbd)
      .pipe(
        map(this.jsonDataToLancamentoEbd),
        catchError(this.handleError),
        //map(this.jsonDataToLancamentoEbdFuncao)
        map(() => lancamentoEbd)
      )
  }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  private jsonDataToLancamentoEbd(jsonData: any): LancamentoEbdDTO {
    return (new LancamentoEbdDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
