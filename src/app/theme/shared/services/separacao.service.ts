import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { SeparacaoDTO } from "../models/separacao.dto";
import { API_CONFIG } from "src/app/app-config";



@Injectable({
    providedIn: 'root'
  })
export class SeparacaoService {


    private apiPath: string = `${API_CONFIG.baseUrl}/separacoes`;


    constructor(
        public http: HttpClient
        ) {
    }

    findAll(): Observable<SeparacaoDTO[]> {
      return this.http.get<SeparacaoDTO>(this.apiPath).pipe(
        catchError(this.handleError),
        map(this.jsonDataToSeparacoes)
      )
    }


    findById(id: number): Observable<SeparacaoDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToSeparacao)
        )
      }

     create(separacao : SeparacaoDTO) {
      return this.http.post(this.apiPath,
        separacao,
          {
              observe: 'response',
              responseType: 'text'
          }
        );
     }

      update(separacao: SeparacaoDTO): Observable<SeparacaoDTO> {
        const url = `${this.apiPath}/${separacao.id}`;

        return this.http.put(url, separacao)
          .pipe(
           map(this.jsonDataToSeparacao),
           catchError(this.handleError),
           //map(this.jsonDataToSeparacao)
           map(() => separacao)
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

      private jsonDataToSeparacoes(jsonData: any[]): SeparacaoDTO[] {
        const separacaos: SeparacaoDTO[] = [];

        jsonData.forEach(element => {
          const separacao = (new SeparacaoDTO(), element);
          separacaos.push(separacao);
        });

        return separacaos;
      }


      private jsonDataToSeparacao(jsonData: any): SeparacaoDTO {
        return (new SeparacaoDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

    }
