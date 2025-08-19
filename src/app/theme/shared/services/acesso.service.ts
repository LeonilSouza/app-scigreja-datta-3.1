import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { API_CONFIG } from '../config/api-config';
import { catchError, map } from 'rxjs/operators';
import { AcessoDTO } from "../models/acesso.dto.";

@Injectable()
export class AcessoService {
    private apiPath: string = `${API_CONFIG.baseUrl}/acessos`;

    constructor(
        public http: HttpClient
        ) {
    }

    findAll(): Observable<AcessoDTO[]> {
      return this.http.get<AcessoDTO>(this.apiPath).pipe(
        catchError(this.handleError),
        map(this.jsonDataToAcessos)
      )
    }


    findById(id: number): Observable<AcessoDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get<AcessoDTO>(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToAcesso)
        )
      }

     create(acesso : AcessoDTO) {
      return this.http.post(this.apiPath,
        acesso,
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

      getByBuscaFromIgrejaUsuario(igrejaId, usuario_id) {

        return this.http.get(`${API_CONFIG.baseUrl}/acessos/busca/?igreja=${igrejaId}&usuario=${usuario_id}`)
          .pipe(
            catchError(this.handleError)
        );
      }



      // PRIVATE METHODS

      private jsonDataToAcessos(jsonData: any[]): AcessoDTO[] {
        const acessos: AcessoDTO[] = [];

        jsonData.forEach(element => {
          const acesso = (new AcessoDTO(), element);
          acessos.push(acesso);
        });

        return acessos;
      }


      private jsonDataToAcesso(jsonData: any): AcessoDTO {
        return (new AcessoDTO(), jsonData);
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }

    }
