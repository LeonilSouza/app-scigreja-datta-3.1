import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { API_CONFIG } from "../config/api-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { TipoCartaDTO } from "../models/tipo-carta.dto";

@Injectable()
export class TipoCartaService {

  private apiPath: string = `${API_CONFIG.baseUrl}/tipocartas`;

  constructor(public http: HttpClient) {
  }

  findAll(): Observable<TipoCartaDTO> { 
    return this.http.get<TipoCartaDTO>(this.apiPath)
      .pipe(
        catchError(this.handleError));
  }


  getPageTipoCarta(nome, page, linesPerPage) { 
    return this.http.get(`${API_CONFIG.baseUrl}/tipocartas/?nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
      .pipe(
        catchError(this.handleError)
    );
  }


  geCountTipoCarta() { 
    return this.http.get(`${API_CONFIG.baseUrl}/tipocartas/count`)
      .pipe(
        catchError(this.handleError)
    );
  }


  findById(id: number): Observable<TipoCartaDTO> {

    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToTipoCarta)
    )
  }

  create(tipoCarta: TipoCartaDTO) {
    return this.http.post(this.apiPath,
      tipoCarta,
      {
        observe: 'response',
        responseType: 'text'
      }
    );
  }

  update(tipoCarta: TipoCartaDTO): Observable<TipoCartaDTO> {
    const url = `${this.apiPath}/${tipoCarta.id}`;

    return this.http.put(url, tipoCarta)
      .pipe(
        map(this.jsonDataToTipoCarta),
        catchError(this.handleError),
        //map(this.jsonDataToTipoCarta)
        map(() => tipoCarta)
      )
  }


  delete(id: number): Observable<any> {

    const url = `${this.apiPath}/${id}`;

    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  private jsonDataToTipoCarta(jsonData: any): TipoCartaDTO {
    return (new TipoCartaDTO(), jsonData);
  }

  private handleError(error: any): Observable<any> {
    console.log("ERRO NA REQUISIÇÃO => ", error);
    return throwError(error);
  }

}
