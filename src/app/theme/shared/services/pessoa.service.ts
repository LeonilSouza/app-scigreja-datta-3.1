import { PessoaDTO, PessoaPatchDTO } from '../models/pessoa.dto';
import { Injectable } from "@angular/core";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {


  private apiPath: string = `${API_CONFIG.baseUrl}/pessoas`;

  constructor(
    public http: HttpClient  ) { }

  // Page
  getByPagePessoasFromIgreja(igrejaId, nomeSemAcento, situacaoCadastral, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/?igreja=${igrejaId}&nomeSemAcento=${nomeSemAcento}&situacaoCadastral=${situacaoCadastral}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getByListaObreirosAtivosFromIgreja(igrejaId) {
    const tipoMembro = 'Obreiro';
    const situacaoCadastral = 'Ativo';
    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/obreiros/?igreja=${igrejaId}&situacaoCadastral=${situacaoCadastral}&tipoMembro=${tipoMembro}`)
      .pipe(
        catchError(this.handleError)
    );
  }

  getPessoasAtivasFromIgreja(igrejaId, situacaoCadastral) {

    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/list/?igreja=${igrejaId}&situacaoCadastral=${situacaoCadastral}`)
      .pipe(
        catchError(this.handleError)
    );
  }

  getPessoasAtivasTransferidasIgreja(igrejaId, situacaoCadastral) {

    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/ativo_transferido/?igreja=${igrejaId}&situacaoCadastral=${situacaoCadastral}`)
      .pipe(
        catchError(this.handleError)
    );
  }

  upload(pessoa: PessoaDTO, formData: FormData): Observable<any> {
    const url = `${this.apiPath}/${pessoa.id}/foto`;
    return this.http.put(url, formData, { responseType: 'blob' });
  }


  getAll(): Observable<PessoaDTO[]> {
    return this.http.get<PessoaDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError)
      )
  }

  getById(id: number) {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToPessoa)
    )
  }

  listaObreiros(id: number) {
    return this.http.get(`${API_CONFIG.baseUrl}/reports/?igreja=${id}`)
}


  countMembrosAtivosFromIgreja(igrejaId, situacaoCadastral,  tipoMembro) {
    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/count/?igreja=${igrejaId}&situacaoCadastral=${situacaoCadastral}&tipoMembro=${tipoMembro}`)
      .pipe(
        catchError(this.handleError)
    );
  }

  countObreirosAtivosFromIgreja(igrejaId, situacaoCadastral, tipoMembro) {
    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/count/?igreja=${igrejaId}&situacaoCadastral=${situacaoCadastral}&tipoMembro=${tipoMembro}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  countNovos(igrejaId, situacaoCadastral) {
    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/novos/?igreja=${igrejaId}&situacaoCadastral=${situacaoCadastral}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  countCongregadosAtivosFromIgreja(igrejaId, situacaoCadastral,  tipoMembro) {
    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/count/?igreja=${igrejaId}&situacaoCadastral=${situacaoCadastral}&tipoMembro=${tipoMembro}`)
      .pipe(
        catchError(this.handleError)
    );
  }

  create(pessoa: PessoaDTO) {
    return this.http.post(this.apiPath,
      pessoa,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(pessoa: PessoaDTO): Observable<PessoaDTO> {
    const url = `${this.apiPath}/${pessoa.id}`;

    return this.http.put(url, pessoa)
      .pipe(
        map(this.jsonDataToPessoa),
        catchError(this.handleError),
        //map(this.jsonDataToPessoa)
        map(() => pessoa)
      )
  }

  updatePatch(pessoa: PessoaPatchDTO): Observable<PessoaPatchDTO> {
    const url = `${this.apiPath}/${pessoa.id}`;
    return this.http.patch(url, pessoa)
      .pipe(
        map(this.jsonDataToPessoa),
        catchError(this.handleError),
        //map(this.jsonDataToPessoa)
        map(() => pessoa)
      )
  }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }

  getListDocumentosFromIgreja(igrejaId, pessoaId, name) {

    return this.http.get(`${API_CONFIG.baseUrl}/documentos/list/?igreja=${igrejaId}&pessoa=${pessoaId}&name=${name}`)
      .pipe(
        catchError(this.handleError)
    );
  }

  // resetPagina() {
  //  window.onbeforeunload = function (e) {
  //   e = e || window.event;
  //   e.preventDefault = true;
  //   e.cancelBubble = true;
  //   e.returnValue = 'Se você sair agora desta atividade, poderaá perder dados não salvos';
  //       }
  //   }

  // PRIVATE METHODS

  private jsonDataToPessoas(jsonData: any[]): PessoaDTO[] {
    const pessoas: PessoaDTO[] = [];

    jsonData.forEach(element => {
      const pessoa = (new PessoaDTO(), element);
      pessoas.push(pessoa);
    });

    return pessoas;
  }


  private jsonDataToPessoa(jsonData: any): PessoaDTO {
    return (new PessoaDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    // console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}