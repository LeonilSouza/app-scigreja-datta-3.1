import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { StorageService } from "./storage.service";
import { catchError, map } from 'rxjs/operators';
import { CasoDTO } from "../models/caso.dto ";
import { API_CONFIG } from "src/app/app-config";



@Injectable({
    providedIn: 'root'
  })
export class CasoService {

    private apiPath: string = (`${API_CONFIG.baseUrl}/casos`);

    constructor(
        public http: HttpClient,
        protected storage: StorageService,
        ) {
    }

    countCasoAtivoFromIgreja(igrejaId: number, situacao: string) {
      return this.http.get(`${API_CONFIG.baseUrl}/casos/count/?igreja=${igrejaId}&situacao=${situacao}`)
        .pipe(
          catchError(this.handleError)
      );
    }
    
    countProvaVencidaFromIgreja(igrejaId: number, situacao: string) {
      return this.http.get(`${API_CONFIG.baseUrl}/casos/count/vencidas?igreja=${igrejaId}&situacao=${situacao}`)
        .pipe(
          catchError(this.handleError)
      );
    }

    getByCasosFromIgreja(igrejaId: number, nome: string, situacao: string , page: number, linesPerPage: number) {

      return this.http.get(`${API_CONFIG.baseUrl}/casos/?igreja=${igrejaId}&nome=${nome}&situacao=${situacao}&page=${page}&linesPerPage=${linesPerPage}`)
        .pipe(
          catchError(this.handleError)
      );
    }

    getProvasVencidasFromIgreja(igrejaId: number, nome: string, situacao: string,  page: number, linesPerPage: number) {

      return this.http.get(`${API_CONFIG.baseUrl}/casos/vencidas?igreja=${igrejaId}&nome=${nome}&situacao=${situacao}&page=${page}&linesPerPage=${linesPerPage}`)
        .pipe(
          catchError(this.handleError)
      );
    }

    getArquivadosFromIgreja(igrejaId: number, nome: string, page: number, linesPerPage: number) {

      return this.http.get(`${API_CONFIG.baseUrl}/casos/arquivados?igreja=${igrejaId}&nome=${nome}&page=${page}&linesPerPage=${linesPerPage}`)
        .pipe(
          catchError(this.handleError)
      );
    }


      findAll(): Observable<CasoDTO[]> {
        return this.http.get<CasoDTO>(this.apiPath).pipe(

          catchError(this.handleError)
          //,map(this.jsonDataToIgrejas) // DA PROBLEMAS COM ENDPOINT PAGINADOS
        )
      }

      getById(id: number): Observable<CasoDTO> {

        const url = `${this.apiPath}/${id}`;

        return this.http.get<CasoDTO>(url).pipe(
          catchError(this.handleError),
          map(this.jsonDataToCasosTratado)
        )
      }

      // create(caso: CasoDTO): Observable<CasoDTO> {

      //   return this.http.post<CasoDTO>(this.apiPath, caso).pipe(
      //     catchError(this.handleError),
      //     map(this.jsonDataToCasosTratado)
      //   )
      // }

      create(caso : CasoDTO) {
        return this.http.post(this.apiPath,
          caso,
            {
                observe: 'response',
                responseType: 'text'
            }
          );
       }

      update(casosTratado: CasoDTO): Observable<CasoDTO> {

        const url = `${this.apiPath}/${casosTratado.id}`;

        return this.http.put<CasoDTO>(url, casosTratado).pipe(
          catchError(this.handleError),
          map(() => casosTratado)
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

      private jsonDataToCasosTratados(jsonData: any[]): CasoDTO[] {
        const casosTratados: CasoDTO[] = [];
        jsonData.forEach(element => casosTratados.push(element as CasoDTO));
        return casosTratados;
      }

      private jsonDataToCasosTratado(jsonData: any): CasoDTO {
        return jsonData as CasoDTO;
      }

      private handleError(error: any): Observable<any>{
        console.log("ERRO NA REQUISIÇÃO => ", error);
        return throwError(error);
      }
    }
