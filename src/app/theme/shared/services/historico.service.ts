import { Injectable } from "@angular/core";
import { API_CONFIG } from "src/app/app-config";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { HistoricoDTO } from "../models/historico.dto";



@Injectable({
    providedIn: 'root'
  })
export class HistoricoService {


    private apiPath: string = `${API_CONFIG.baseUrl}/historicos`;


    constructor(
        public http: HttpClient
        ) {
    }

    findAll(): Observable<HistoricoDTO[]> {
      return this.http.get<HistoricoDTO>(this.apiPath).pipe(
        catchError(this.handleError),
        map(this.jsonDataToHistoricos)
      )
    }


    findById(id: number): Observable<HistoricoDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToHistorico)
        )
      }

     create(historico : HistoricoDTO) {
      return this.http.post(this.apiPath,
        historico,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }


      delete(id: number): Observable<any> {

        const url = `${this.apiPath}/${id}`;

        return this.http.delete(url).pipe(
          catchError(this.handleError),
          map(() => null)
        )
      }



      // PRIVATE METHODS

      private jsonDataToHistoricos(jsonData: any[]): HistoricoDTO[] {
        const historicos: HistoricoDTO[] = [];

        jsonData.forEach(element => {
          const historico = (new HistoricoDTO(), element);
          historicos.push(historico);
        });

        return historicos;
      }


      private jsonDataToHistorico(jsonData: any): HistoricoDTO {
        return (new HistoricoDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

    }
