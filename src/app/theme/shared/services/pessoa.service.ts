import { PessoaDTO, PessoaPatchDTO } from '../models/pessoa.dto';
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from 'src/app/app-config';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {


  private apiPath: string = `${API_CONFIG.baseUrl}/pessoas`;

  constructor(
    public http: HttpClient) { }

  // Page
  getByPagePessoasFromIgreja(igrejaId: number, nomeSemAcento: string, situacaoCadastral: string, page: number, linesPerPage: any) {

    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/?igreja=${igrejaId}&nomeSemAcento=${nomeSemAcento}&situacaoCadastral=${situacaoCadastral}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getByListaObreirosAtivosFromIgreja(igrejaId: number) {
    const tipoMembro = 'Obreiro';
    const situacaoCadastral = 'Ativo';
    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/obreiros/?igreja=${igrejaId}&situacaoCadastral=${situacaoCadastral}&tipoMembro=${tipoMembro}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getPessoasAtivasFromIgreja(igrejaId: number, situacaoCadastral: string) {

    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/list/?igreja=${igrejaId}&situacaoCadastral=${situacaoCadastral}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getPessoasAtivasTransferidasIgreja(igrejaId: number, situacaoCadastral: string) {

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

  y: any
  countMembrosAtivosFromIgreja(igrejaId: number, situacaoCadastral: string, tipoMembro: string) {
    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/count/?igreja=${igrejaId}&situacaoCadastral=${situacaoCadastral}&tipoMembro=${tipoMembro}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  countObreirosAtivosFromIgreja(igrejaId: any, situacaoCadastral: any, tipoMembro: any) {
    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/count/?igreja=${igrejaId}&situacaoCadastral=${situacaoCadastral}&tipoMembro=${tipoMembro}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  countNovos(igrejaId: number, situacaoCadastral: string) {
    return this.http.get(`${API_CONFIG.baseUrl}/pessoas/novos/?igreja=${igrejaId}&situacaoCadastral=${situacaoCadastral}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  countCongregadosAtivosFromIgreja(igrejaId: any, situacaoCadastral: any, tipoMembro: any) {
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

  getListDocumentosFromIgreja(igrejaId: any, pessoaId: any, name: any) {

    return this.http.get(`${API_CONFIG.baseUrl}/documentos/list/?igreja=${igrejaId}&pessoa=${pessoaId}&name=${name}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // RELATORIOS

  gerarFichaMembro(id: number): Observable<Blob> {
    return this.http.get(`${API_CONFIG.baseUrl}/relatorios/pessoas/${id}/ficha-membro`, {
      responseType: 'blob'
    });
  }


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