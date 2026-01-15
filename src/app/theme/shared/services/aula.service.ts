import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from "src/app/app-config";
import { AulaNewDTO } from "../models/aula-new-dto.dto";


@Injectable()
export class AulaService {

  private apiPath: string = `${API_CONFIG.baseUrl}/aulas`;

  constructor(public http: HttpClient) {
  }

  createAulaComFrequencias(dto: AulaNewDTO): Observable<string> {
    return this.http.post(`${this.apiPath}`, dto, {
      // Como o  Controller no Java retorna ResponseEntity.ok("Mensagem"),
      // precisamos avisar o Angular para tratar a resposta como texto, não JSON.
      responseType: 'text'
    });
  }

  /**
   * Opcional: Lista todas as aulas para um histórico
   */
  listarAulas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiPath);
  }


  findAll(): Observable<AulaNewDTO> {
    return this.http.get<AulaNewDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError));
  }

  getById(id: number): Observable<AulaNewDTO> {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      //  map(this.jsonDataToAula)
    )
  }

  checkDataFromAula(igrejaId, data) { // Verifica se a data já foi lançada retorna true| false
    return this.http.get(`${API_CONFIG.baseUrl}/aulas/verificarData/?igreja=${igrejaId}&data=${data}`)
      .pipe(
        catchError(this.handleError)
      );
  }

//  verificaAnoEscalaFromIgreja(igrejaId, data) {

//     return this.http.get(`${API_CONFIG.baseUrl}/aulas/verificarAno/?igreja=${igrejaId}&data=${data}`)
//       .pipe(
//         catchError(this.handleError)
//       );
//   }

  getByPageAulaFromTipo(igrejaId, nome, page, linesPerPage) {

    return this.http.get(`${API_CONFIG.baseUrl}/aulas/page/?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getListAulaFromIgreja(igrejaId) {

    return this.http.get(`${API_CONFIG.baseUrl}/aulas/list/?igreja=${igrejaId}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  create(aula: AulaNewDTO) {
    return this.http.post(this.apiPath,
      aula,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(aula: AulaNewDTO): Observable<AulaNewDTO> {
    const url = `${this.apiPath}/${aula.id}`;

    return this.http.put(url, aula)
      .pipe(
        // map(this.jsonDataToAula),
        catchError(this.handleError),
        //map(this.jsonDataToAulaFuncao)
        map(() => aula)
      )
  }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  // private jsonDataToAula(jsonData: any): AulaNewDTO {
  //   return (new AulaNewDTO(), jsonData);
  // }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
