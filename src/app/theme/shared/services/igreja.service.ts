import { EventEmitter, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { IgrejaDTO } from "../models/igreja.dto";
import { API_CONFIG } from "src/app/app-config";
// import { nomeIgrejaSignal } from "../_helpers/shared-signals";



@Injectable({
  providedIn: 'root'
})
export class IgrejaService {

  private apiPath: string = `${API_CONFIG.baseUrl}/igrejas`;

  // nomeIgrejaSignal = nomeIgrejaSignal; //Signal 
  // nomeIgreja = nomeIgrejaSignal();

  constructor(
    public http: HttpClient
  ) {
    // this.nomeIgreja = GLOBALS.nomeIgreja
  }


  getPageFromIgreja(nome: string, setor: number, page: number, linesPerPage: any) {

    return this.http.get(`${API_CONFIG.baseUrl}/igrejas/page/?nome=${nome}&setor=${setor}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  uploadLogo(igreja: IgrejaDTO, formData: FormData): Observable<any> {
    const url = `${this.apiPath}/${igreja.id}/logo`;
    return this.http.put(url, formData, { responseType: 'blob' });
  }

  uploadAssinatura(id: any, file: File): Observable<void> {
    const formData = new FormData();
    formData.append('file', file); // Vincula o arquivo binário à chave 'file' esperada pelo Java

    return this.http.put<void>(`${API_CONFIG.baseUrl}/igrejas/${id}/upload-assinatura`, formData);
}


  getByIgrejaFromSetor(setor_id: number) {

    return this.http.get(`${API_CONFIG.baseUrl}/igrejas/page/?setor=${setor_id}`)

      .pipe(
        catchError(this.handleError)
      );
  }

  findAll(): Observable<IgrejaDTO[]> {
    return this.http.get<IgrejaDTO>(this.apiPath).pipe(

      catchError(this.handleError)
      //,map(this.jsonDataToIgrejas) // DA PROBLEMAS COM ENDPOINT PAGINADOS
    )
  }

  getById(id: number) {

    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError)
    )
  }

  create(igreja: IgrejaDTO) {
    return this.http.post(this.apiPath,
      igreja,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(igreja: IgrejaDTO): Observable<IgrejaDTO> {
    const url = `${this.apiPath}/${igreja.id}`;

    return this.http.put(url, igreja)
      .pipe(
        map(this.jsonDataToIgreja),
        catchError(this.handleError),
        //map(this.jsonDataToIgreja)
        map(() => igreja)
      )
  }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }



  // PRIVATE METHODS

  private jsonDataToIgrejas(jsonData: any[]): IgrejaDTO[] {
    const igrejas: IgrejaDTO[] = [];

    jsonData.forEach(element => {
      const igreja = (new IgrejaDTO(), element);
      igrejas.push(igreja);
    });

    return igrejas;
  }


  private jsonDataToIgreja(jsonData: any): IgrejaDTO {
    return (new IgrejaDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
