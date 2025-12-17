import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from "src/app/app-config";
import { DiarioClasseDTO } from "../models/diario-classe.dto";


@Injectable()
export class DiarioClasseService {

  private apiPath: string = `${API_CONFIG.baseUrl}/diarioclasses`;
  private apiPath2: string = `${API_CONFIG.baseUrl}/diarioclasses/diario`;

  constructor(public http: HttpClient) {
  }

  findAll(): Observable<DiarioClasseDTO> {
    return this.http.get<DiarioClasseDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError));
  }

   getById(id: number): Observable<DiarioClasseDTO> {
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
       map(this.jsonDataToDiarioClasse)
    )
  }

  getListDiarioClasseFromIgreja(igrejaId, data) {

    return this.http.get(`${API_CONFIG.baseUrl}/diarioclasses/?igreja=${igrejaId}&data=${data}`)
      .pipe(
        catchError(this.handleError)
      );
  }

   getByPageDiarioClasseFromIgreja(igrejaId, data, page, linesPerPage) {

        return this.http.get(`${API_CONFIG.baseUrl}/diarioclasses/page/?igreja=${igrejaId}&data=${data}&page=${page}&linesPerPage=${linesPerPage}`)
          .pipe(
            catchError(this.handleError)
        );
      }

   salvarDiarioClasse(diarioClasse: any[]): Observable<any> {
    // O Angular/HttpClient automaticamente serializa o array para JSON
    return this.http.post<any>(this.apiPath2, diarioClasse);
  }

  update(diarioClasse: DiarioClasseDTO): Observable<DiarioClasseDTO> {
    const url = `${this.apiPath}/${diarioClasse.id}`;

    return this.http.put(url, diarioClasse)
      .pipe(
        map(this.jsonDataToDiarioClasse),
        catchError(this.handleError),
        //map(this.jsonDataToDiarioClasseFuncao)
        map(() => diarioClasse)
      )
  }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  private jsonDataToDiarioClasse(jsonData: any): DiarioClasseDTO {
    return (new DiarioClasseDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
